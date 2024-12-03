from django.contrib.auth.models import User
from django.http import JsonResponse
import json

def send_friend_request(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if not request.user.is_authenticated:
		return JsonResponse({'message': 'User not authenticated'}, status=400)

	try:
		data = json.loads(request.body)

		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
		username = data['username']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON"}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data"}, status=400)

	if not username or not isinstance(username, str):
		return JsonResponse({'message': 'Missing username'}, status=400)

	if (username == request.user.username):
		return JsonResponse({'message': 'Can\'t send friend request to yourself'}, status=400)

	try:
		new_friend = User.objects.get(username=username)
		user = request.user
		if (new_friend.profile.blocked_users.filter(pk=user.pk)).exists():
			return JsonResponse({'message': 'The user blocked you'}, status=403)
		if (user.profile.blocked_users.filter(pk=new_friend.pk)).exists():
			return JsonResponse({'message': 'You blocked the user'}, stauts=403)
		if (user.profile.friends_request.filter(pk=new_friend.pk)).exists():
			new_friend.profile.friends.add(user)
			new_friend.save()
			user.profile.friends_request.remove(new_friend)
			user.profile.friends.add(new_friend)
			user.save()
			return JsonResponse({'message': 'Succesfully added friend'})
		elif not ((new_friend.profile.friends_request.filter(pk=user.pk)).exists()):
			new_friend.profile.friends_request.add(user)
			new_friend.save()
			return JsonResponse({'message': 'Request succesfully sent'})
		else :
			return JsonResponse({'message': 'Request already sent'})
	except User.DoesNotExist:
		return JsonResponse({'message': 'Can\'t find user'}, status=404)

def accept_friend_request(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if not request.user.is_authenticated:
		return JsonResponse({'message': 'User not authenticated'}, status=400)
	try:
		data = json.loads(request.body)
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
		username = data['username']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON"}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data"}, status=400)

	if not username or not isinstance(username, str):
		return JsonResponse({'message': 'Missing username'}, status=400)

	if (username == request.user.username):
		return JsonResponse({'message': 'Can\'t accept friend request from yourself'}, status=400)
	try:
		new_friend = User.objects.get(username=username)
		user = request.user
		new_friend.profile.friends.add(user)
		new_friend.save()
		user.profile.friends_request.remove(new_friend)
		user.profile.friends.add(new_friend)
		user.save()
		return JsonResponse({'message': 'Succesfully added friend'}, status=200)
	except User.DoesNotExist:
		return JsonResponse({'message': 'Can\'t find user'}, status=404)

def reject_friend_request(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if not request.user.is_authenticated:
		return JsonResponse({'message': 'User not authenticated'}, status=400)
	try:
		data = json.loads(request.body)
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
		username = data['username']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON"}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data"}, status=400)

	if not username or not isinstance(username, str):
		return JsonResponse({'message': 'Missing username'}, status=400)

	if (username == request.user.username):
		return JsonResponse({'message': 'Can\'t reject friend request from yourself'}, status=400)

	try:
		new_friend = User.objects.get(username=username)
		user = request.user
		user.profile.friends_request.remove(new_friend)
		user.save()
		return JsonResponse({'message': 'Succesfully added friend'})
	except User.DoesNotExist:
		return JsonResponse({'message': 'Can\'t find user'}, status=404)

def remove_friend(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if not request.user.is_authenticated:
		return JsonResponse({'message': 'User not authenticated'}, status=400)
	try:
		data = json.loads(request.body)
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
		username = data['username']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON"}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data"}, status=400)

	if not username or not isinstance(username, str):
		return JsonResponse({'message': 'Missing username'}, status=400)

	if (username == request.user.username):
		return JsonResponse({'message': 'Can\'t remove friend from yourself'}, status=400)

	try:
		friend = User.objects.get(username=username)
		user = request.user
		friend.profile.friends.remove(user)
		friend.save()
		user.profile.friends.remove(friend)
		user.save()
		return JsonResponse({'message': 'Succesfully added friend'})
	except User.DoesNotExist:
		return JsonResponse({'message': 'Can\'t find user'}, status=404)

def block_friend(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if not request.user.is_authenticated:
		return JsonResponse({'message': 'User not authenticated'}, status=400)
	try:
		data = json.loads(request.body)
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
		username = data['username']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON"}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data"}, status=400)

	if not username or not isinstance(username, str):
		return JsonResponse({'message': 'Missing username'}, status=400)

	if (username == request.user.username):
		return JsonResponse({'message': 'Can\'t block friend from yourself'}, status=400)

	try:
		ennemy = User.objects.get(username=username)
		if (ennemy.is_staff):
			return JsonResponse({'message': 'Can\'t block staff member'}, status=401)
		user = request.user
		if (user.profile.friends.filter(pk=ennemy.pk)).exists():
			ennemy.profile.friends.remove(user)
			ennemy.save()
			user.profile.friends.remove(ennemy)
			user.save()
		user.profile.blocked_users.add(ennemy)
		user.save()
		return JsonResponse({'message': 'Succesfully blocked user'})
	except User.DoesNotExist:
		return JsonResponse({'message': 'Can\'t find user'}, status=404)

def unblock_user(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if not request.user.is_authenticated:
		return JsonResponse({'message': 'User not authenticated'}, status=400)
	try:
		data = json.loads(request.body)
		username = data['username']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON"}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data"}, status=400)

	if not username or not isinstance(username, str):
		return JsonResponse({'message': 'Missing username'}, status=400)

	if (username == request.user.username):
		return JsonResponse({'message': 'Can\'t unblock yourself'}, status=400)

	try:
		request.user.profile.blocked_users.remove(User.objects.get(username=username))
		request.user.save()
		return JsonResponse({'message': 'Succesfully unblocked user'})
	except User.DoesNotExist:
		return JsonResponse({'message': 'Can\'t find user'}, status=404)
