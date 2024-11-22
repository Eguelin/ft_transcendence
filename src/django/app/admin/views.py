from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from django.db import DatabaseError
import json, os, random
import login.views
import game.models as customModels

def generate_unique_username(base_username):
	username = base_username
	counter = 1
	while User.objects.filter(username=username).exists():
		username = f"{base_username}{counter}"
		counter += 1
	return username

def create_user(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)
	if not request.user.is_staff:
		return JsonResponse({'message': 'user is not admin'}, status=403)
	return login.views.create_user(request, staff=True)

def remove_user(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)
	if not request.user.is_staff:
		return JsonResponse({'message': 'user is not admin'}, status=403)

	try:
		data = json.loads(request.body)
		username = data['username']

		if not username or not isinstance(username, str):
			return JsonResponse({'message': 'Invalid Data'}, status=400)

		User.objects.get(username=username).delete()

		return JsonResponse({'message': 'User deleted'}, status=200)

	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

	except KeyError:
		return JsonResponse({'message': 'Missing Data'}, status=400)

	except User.DoesNotExist:
		return JsonResponse({'message': 'User not found'}, status=404)

	except Exception:
		return JsonResponse({'message': 'Internal server error'}, status=500)

def create_match(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)
	if not request.user.is_staff:
		return JsonResponse({'message': 'user is not admin'}, status=403)

	try:
		data = json.loads(request.body)
		nbr = data['range']
		userOne = data['userOne']
		userTwo = data['userTwo']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data: " + str(request.body)}, status=400)

	if not isinstance(nbr, int) or nbr < 1 or not isinstance(userOne, str) or not isinstance(userTwo, str):
		return JsonResponse({'message':  "Invalid Data: " + str(request.body)}, status=400)

	matches = {}
	for i in range(0, nbr):
		try:
			match = customModels.Match.objects.createWithTwoOpps(userOne, userTwo)
			matches[i] = {'playerOne': match.player_one.username,
						'playerTwo': match.player_two.username,
						'playerOnePts': match.player_one_pts,
						'playerTwoPts': match.player_two_pts,
						'date': match.date,}
		except DatabaseError:
			return JsonResponse({'message':  "Database error"}, status=500)
		except Exception:
			return JsonResponse({'message':  "Internal server error"}, status=500)

	return JsonResponse({'message': 'Matches created', 'matches' : matches}, status=201)

def create_friendship(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)
	if not request.user.is_staff:
		return JsonResponse({'message': 'user is not admin'}, status=403)

	try:
		data = json.loads(request.body)
		userOne = data['userOne']
		userTwo = data['userTwo']
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)
	except KeyError:
		return JsonResponse({'message': 'Missing Data'}, status=400)

	if not userOne or not isinstance(userOne, str) or not userTwo or not isinstance(userTwo, str):
		return JsonResponse({'message': 'Invalid Data'}, status=400)

	if not User.objects.filter(username=userOne).exists():
		user1 = User.objects.create_user(username=userOne, password="password")
		user1.profile.profile_picture = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))
		user1.id42 = 0
	else:
		user1 = User.objects.get(username=userOne)

	if not User.objects.filter(username=userTwo).exists():
		user2 = User.objects.create_user(username=userTwo, password="password")
		user2.profile.profile_picture = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))
		user2.id42 = 0
	else:
		user2 = User.objects.get(username=userTwo)

	if (user1.profile.friends_request.filter(pk=user2.pk).exists()):
		user1.profile.friends_request.remove(user2)
	if (user2.profile.friends_request.filter(pk=user1.pk).exists()):
		user2.profile.friends_request.remove(user1)

	if (user1.profile.blocked_users.filter(pk=user2.pk).exists()):
		user1.profile.blocked_users.remove(user2)
	if (user2.profile.blocked_users.filter(pk=user1.pk).exists()):
		user2.profile.blocked_users.remove(user1)
	user1.profile.friends.add(user2)
	user1.save()
	user2.profile.friends.add(user1)
	user2.save()
	return JsonResponse({'message': 'Friendship created'}, status=201)

def create_friendship_request(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)
	if not request.user.is_staff:
		return JsonResponse({'message': 'user is not admin'}, status=403)

	try:
		data = json.loads(request.body)
		to = data['to']
		from_ = data['from']
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)
	except KeyError:
		return JsonResponse({'message': 'Missing Data'}, status=400)

	if not to or not isinstance(to, str) or not from_ or not isinstance(from_, str):
		return JsonResponse({'message': 'Invalid Data'}, status=400)

	if not User.objects.filter(username=to).exists():
		user1 = User.objects.create_user(username=to, password="password")
		user1.profile.profile_picture = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))
		user1.id42 = 0
	else:
		user1 = User.objects.get(username=to)

	if not User.objects.filter(username=from_).exists():
		user2 = User.objects.create_user(username=from_, password="password")
		user2.profile.profile_picture = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))
		user2.id42 = 0
	else:
		user2 = User.objects.get(username=from_)

	if ((user1.profile.friends.filter(pk=user2.pk)).exists()):
		user1.profile.friends.remove(user2)
	if ((user2.profile.friends.filter(pk=user1.pk)).exists()):
		user2.profile.friends.remove(user1)

	if ((user1.profile.blocked_users.filter(pk=user2.pk)).exists()):
		user1.profile.blocked_users.remove(user2)
	if ((user2.profile.blocked_users.filter(pk=user1.pk)).exists()):
		user2.profile.blocked_users.remove(user1)
	if not ((user1.profile.friends_request.filter(pk=user2.pk)).exists()):
		user1.profile.friends_request.add(user2)
		user1.save()
	return JsonResponse({'message': 'Friendship request created'}, status=201)

def create_blocked_friendship(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)
	if not request.user.is_staff:
		return JsonResponse({'message': 'user is not admin'}, status=403)

	try:
		data = json.loads(request.body)
		userOne = data['userOne']
		userTwo = data['userTwo']
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)
	except KeyError:
		return JsonResponse({'message': 'Missing Data'}, status=400)

	if not userOne or not isinstance(userOne, str) or not userTwo or not isinstance(userTwo, str):
		return JsonResponse({'message': 'Invalid Data'}, status=400)

	if not User.objects.filter(username=userOne).exists():
		user1 = User.objects.create_user(username=userOne, password="password")
		user1.profile.profile_picture = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))
		user1.id42 = 0
	else:
		user1 = User.objects.get(username=userOne)

	if not User.objects.filter(username=userTwo).exists():
		user2 = User.objects.create_user(username=userTwo, password="password")
		user2.profile.profile_picture = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))
		user2.id42 = 0
	else:
		user2 = User.objects.get(username=userTwo)

	if (user1.profile.friends.filter(pk=user2.pk).exists()):
		user1.profile.friends.remove(user2)
	if (user2.profile.friends.filter(pk=user1.pk).exists()):
		user2.profile.friends.remove(user1)

	if (user1.profile.friends_request.filter(pk=user2.pk).exists()):
		user1.profile.friends_request.remove(user2)
	if (user2.profile.friends_request.filter(pk=user1.pk).exists()):
		user2.profile.friends_request.remove(user1)

	user1.profile.blocked_users.add(user2)
	user1.save()
	user2.profile.blocked_users.add(user1)
	user2.save()
	return JsonResponse({'message': 'Blocked friendship created'}, status=201)

def delete_user(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if (request.user.is_authenticated):
		try:
			request.user.delete()
			return JsonResponse({'message': 'User deleted'}, status=200)
		except Exception as e:
			return JsonResponse({'message': e}, status=500)
	else:
		return JsonResponse({'message': "Client is not logged"}, status=401)

def file_opener(path, flags):
	return os.open(path, flags, 0o777)

def get_all_user_match_json(matches):
	matches_json = {}
	year_json = {}
	month_json = {}
	date_json = {}
	dateObj = ""
	year = ""
	month = ""
	day = ""
	i = 0
	for match in matches:
		if (dateObj != match.date):
			if (year != ""):
				if (year != match.date.year):
					matches_json["{0}".format(year)] = year_json
					year_json = {}
				if (month != match.date.month):
					year_json["{0}".format(month)] = month_json
					month_json = {}
				if (day != match.date.day):
					month_json["{0}".format(day)] = date_json
			dateObj = match.date
			year = dateObj.year
			month = dateObj.month
			day = dateObj.day
			date_json = {}
			i = 0
		date_json[i] = {
			'player_one' : match.player_one.username,
			'player_two' : match.player_two.username,
			'player_one_pts' : match.player_one_pts,
			'player_two_pts' : match.player_two_pts,
			'date' : match.date,
		}
		i += 1
	if (dateObj != ""):
		month_json["{0}".format(day)] = date_json
		year_json["{0}".format(month)] = month_json
		matches_json["{0}".format(year)] = year_json
	return matches_json

def get_user_match(matches):
	matches_json = {}
	date = ""
	i = 0
	for match in matches:
		matches_json[i] = {
			'player_one' : match.player_one.username,
			'player_two' : match.player_two.username,
			'player_one_pts' : match.player_one_pts,
			'player_two_pts' : match.player_two_pts,
			'date' : match.date,
		}
		i += 1
	return matches_json

def get_user_json(user, startDate, endDate):
	matches = get_all_user_match_json(user.profile.matches.order_by("date").filter(date__range=(startDate, endDate)))
	return {'username' : user.username,
		'pfp' : user.profile.profile_picture,
		'is_active' : user.profile.is_active,
		'matches' : matches
	}

def get_user_preview_json(user):
	return {'username' : user.username,
		'pfp' : user.profile.profile_picture,
		'is_active' : user.profile.is_active,
	}
