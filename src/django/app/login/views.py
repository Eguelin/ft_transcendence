import json, os, requests, base64, random, string, datetime,zxcvbn, re, io
import game.models as gameModels
from django.contrib.auth import login, authenticate, logout
from django.db import DatabaseError
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from django.core.validators import RegexValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
from transcendence.settings import DEBUG
from PIL import Image

def getClientId(request):
	clientId = os.getenv('API_42_PUBLIC')
	if not clientId:
		return JsonResponse({'message': 'Client ID not set'}, status=400)
	return JsonResponse({'clientId': clientId})

def fortytwo(request):
	create_ai()
	create_nobody()
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)

	try:
		data = json.loads(request.body)
		code = data['code']
		hostname = data['hostname']
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)
	except KeyError:
		return JsonResponse({'message': 'Missing data'}, status=400)

	if not code or not hostname or not isinstance(code, str) or not isinstance(hostname, str):
		return JsonResponse({'message': 'Invalid data'}, status=400)

	client_id = os.getenv('API_42_PUBLIC')
	client_secret = os.getenv('API_42_SECRET')
	redirect_uri = 'https://' + hostname + '/'
	url = 'https://api.intra.42.fr/oauth/token'
	payload = {
		'grant_type': 'authorization_code',
		'client_id': client_id,
		'client_secret': client_secret,
		'code': code,
		'redirect_uri': redirect_uri,
	}
	response = requests.post(url, data=payload)
	if response.status_code != 200:
		return JsonResponse(response.json(), status=response.status_code)

	access_token = response.json().get('access_token')
	if not access_token:
		return JsonResponse({'message': 'Invalid response from 42 API'}, status=400)

	url = 'https://api.intra.42.fr/v2/me'
	headers = {
		'Authorization': f'Bearer {access_token}'
	}
	response = requests.get(url, headers=headers)
	if response.status_code != 200:
		return JsonResponse(response.json(), status=response.status_code)

	user_json = response.json()
	user_login = user_json.get('login')
	pfp_url = user_json.get('image', {}).get('link', '')
	if not pfp_url:
		pfp_url = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))

	username = re.sub(r'\W+', '', user_login)
	user_login = username[:8]

	id42 = user_json.get('id')
	if not user_login or id42 is None:
		return JsonResponse({'message': 'Invalid response from 42 API'}, status=400)

	try:
		user = User.objects.get(profile__id42=id42)
		user = authenticate(request, username=user.username, password=str(id42))
		if user is not None:
			user.profile.is_active = True
			user.save()
			login(request, user)
			return JsonResponse({'message': 'User logged in', 'content': pfp_url}, status=200)
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=401)
	except User.DoesNotExist:
		username = user_login
		while User.objects.filter(username=username).exists():
			username = user_login + "_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
		user = User.objects.create_user(username=username)

		display_name = username
		while User.objects.filter(profile__display_name=display_name).exists():
			display_name = "Player_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

		user.set_password(str(id42))
		user.save()
		user.profile.profile_picture = pfp_url
		user.profile.id42 = id42
		user.profile.is_active = True
		user.profile.display_name = display_name

		user.profile.save()
		user = authenticate(request, username=user.username, password=str(id42))
		if user is not None:
			login(request, user)
			return JsonResponse({'message': 'User created and logged in', 'pfp': pfp_url})
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=401)

def check_username(username):
	if not username or not isinstance(username, str):
		return False, 'Invalid username'

	username_validator = RegexValidator(regex=r'^[\w-]+$', message='Username must be alphanumeric')
	max_length_validator = MaxLengthValidator(15, message='Username must be 15 characters or fewer')

	try:
		username_validator(username)
		max_length_validator(username)
	except ValidationError as e:
		return False, e.message

	if User.objects.filter(username=username).exists():
		return False, 'Username already taken'

	return True, None

def check_password(password, staff=False):
	if not password or not isinstance(password, str):
		return False, 'Invalid password'

	if staff:
		return True, None

	if len(password) > 128:
		return False, 'Password too long'
	if len(password) == 0:
		return False, 'Password too short'

	result = zxcvbn.zxcvbn(password)
	if result['score'] < 4 and not DEBUG:
		return False, 'Password too weak'

	return True, None

def create_user(request, staff=False):
	create_ai()
	create_nobody()

	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)

	try:
		data = json.loads(request.body)
		username = data['username']
		password = data['password']
		language = data['lang']
		theme_name = data['theme_name']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data: " + str(request.body)}, status=400)

	valid, message = check_username(username)
	if not valid:
		return JsonResponse({'message': message}, status=400)

	valid, message = check_password(password, staff)
	if not valid:
		return JsonResponse({'message': message}, status=400)

	display_name = username
	while User.objects.filter(profile__display_name=display_name).exists():
		display_name = "Player_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

	try:
		if (username == "admin"):
			user = User.objects.create_user(username=username, password=password, is_staff=True)
		else:
			user = User.objects.create_user(username=username, password=password)
		user.profile.profile_picture = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))
		user.profile.id42 = 0
		user.profile.is_active = True
		user.profile.display_name = display_name
		user.profile.language_pack = language
		user.profile.theme_name = theme_name
		user.save()
		user = authenticate(request, username=username, password=password)
		return JsonResponse({'message': 'User created'}, status=201)
	except DatabaseError:
		return JsonResponse({'message':  "Database error"}, status=500)
	except Exception:
		return JsonResponse({'message':  "Internal server error"}, status=500)

def create_ai():
	if User.objects.filter(username="AI").exists():
		return
	username = "AI"
	password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=200))
	user = User.objects.create_user(username=username, password=password)
	user.profile.profile_picture = "/images/defaults/defaultAi.gif"
	user.profile.display_name = "AI"
	user.id42 = 0
	user.save()

def create_nobody():
	if User.objects.filter(username="nobody").exists():
		return User.objects.get(username="nobody")
	username = "nobody"
	password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=200))
	user = User.objects.create_user(username=username, password=password)
	user.profile.profile_picture = "/images/defaults/thisman.jpg"
	user.profile.display_name = "nobody"
	user.id42 = 0
	user.save()
	return user

def user_login(request):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)

	try:
		data = json.loads(request.body)
		username = data['username']
		password = data['password']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data: " + str(request.body)}, status=400)

	if not username or not password or not isinstance(username, str) or not isinstance(password, str):
		return JsonResponse({'message':  "Invalid Data: " + str(request.body)}, status=400)

	if len(password) > 128:
		return JsonResponse({'message': 'Password too long'}, status=400)

	try:
		user = User.objects.get(username=username)

		if user.profile.id42 != 0:
			return JsonResponse({'message': 'Forbidden'}, status=403)

		user = authenticate(request, username=username, password=password)
		if user is not None:
			user.profile.is_active = True
			user.save()
			login(request, user)
			return JsonResponse({'message': 'User logged in'}, status=200)
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'message': 'Invalid credentials'}, status=400)
	except DatabaseError:
		return JsonResponse({'message':  "Database error"}, status=500)
	except Exception:
		return JsonResponse({'message':  "Internal server error"}, status=500)

def user_logout(request):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message':  "Client is not logged"}, status=401)

	request.user.profile.is_active = False
	request.user.save()
	logout(request)

	return JsonResponse({'message':  'logged out'}, status=200)

def delete_user(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)
	try:
		request.user.delete()
		return JsonResponse({'message': 'User deleted'}, status=200)
	except Exception:
		return JsonResponse({'message':  "Internal server error"}, status=500)

def file_opener(path, flags):
	return os.open(path, flags, 0o777)

def set_pfp(user, pfp):
	if not pfp or not isinstance(pfp, str):
		return False, 'Invalid pfp value, should be a string'

	try:
		image_data = base64.b64decode(pfp)
		image = Image.open(io.BytesIO(image_data))
		image.verify()

		image = Image.open(io.BytesIO(image_data))

		if image.format not in ['JPEG', 'PNG', 'GIF']:
			return False, 'Image format not supported, use JPEG, PNG or GIF'
	except:
		return False, 'Invalid base64 string'

	if os.path.exists(user.profile.profile_picture) and user.profile.profile_picture.find("/defaults/") == -1:
		os.remove(user.profile.profile_picture)

	pfpName = f"/images/{user.username}.{image.format.lower()}"
	with open(pfpName, "wb", opener=file_opener) as f:
		f.write(image_data)

	user.profile.profile_picture = pfpName
	return True, None

def profile_update(request):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)

	valid = False
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)

	user = request.user
	boolean_fields = ["do_not_disturb", "is_active"]
	for field in boolean_fields:
		if field in data:
			valid = True
			if not isinstance(data[field], (bool)):
				return JsonResponse({'message': 'Invalid {0} value, should be a boolean'.format(field)}, status=400)
			setattr(user.profile, field, data[field])

	if "username" in data:
		valid, message = check_username(data['username'])
		if not valid:
			return JsonResponse({'message': message}, status=400)
		user.username = data['username']

	if "display_name" in data:
		valid, message = check_username(data['display_name'])
		if not valid:
			return JsonResponse({'message': message}, status=400)
		user.profile.display_name = data['display_name']

	if "pfp" in data:
		valid, message = set_pfp(user, data['pfp'])
		if not valid:
			return JsonResponse({'message': message}, status=400)

	if ("language_pack" in data):
		valid = True
		languages = ["lang/DE_GE.json",
					"lang/EN_UK.json",
					"lang/FR_FR.json",
					"lang/IT_IT.json"]
		language = data['language_pack']
		if not language or not isinstance(language, str):
			return JsonResponse({'message': 'Invalid language_pack value, should be a string'}, status=400)
		if language not in languages:
			return JsonResponse({'message': "Invalid language_pack value, should be 'lang/DE_GE.json', 'lang/EN_UK.json', 'lang/FR_FR.json' or 'lang/IT_IT.json"}, status=400)
		user.profile.language_pack = data['language_pack']

	if ("font_amplifier" in data):
		valid = True
		size = data['font_amplifier']
		if not isinstance(size, (float, int)):
			return JsonResponse({'message': 'Invalid font_amplifier value, should be a float'}, status=400)
		if size < 0.5 or size > 1.5:
			return JsonResponse({'message': 'Invalid font_amplifier value, should be between 0.5 and 2'}, status=400)
		user.profile.font_amplifier = size

	if "theme_name" in data:
		valid = True
		themes = ["dark", "light", "high_dark", "high_light", "browser"]
		theme = data['theme_name']

		if not theme or not isinstance(theme, str):
			return JsonResponse({'message': 'Invalid theme_name value, should be a string'}, status=400)
		if theme not in themes:
			return JsonResponse({'message': "Invalid theme_name value, should be 'dark', 'light', 'high_dark', 'high_light' or 'browser'"}, status=400)

		user.profile.theme_name = data['theme_name']

	if (valid == False):
		return JsonResponse({'message': 'Field does not exist'}, status=400)

	user.save()
	return JsonResponse({'message': 'User profile updated'}, status=200)

def get_user_match_json(user_origin, matches, tournaments, username, max=-1):
	matches_json = {}
	year_json = {}
	month_json = {}
	date_json = {}
	dateObj = ""
	year = ""
	month = ""
	day = ""
	i = 0
	total_count = 0

	for tournament in tournaments:
		if (max != -1 and total_count >= max):
			break
		if (dateObj != tournament.date):
			if (year != ""):
				if (year != tournament.date.year):
					matches_json["{0}".format(year)] = year_json
					year_json = {}
				if (month != tournament.date.month):
					year_json["{0}".format(month)] = month_json
					month_json = {}
				if (day != tournament.date.day):
					month_json["{0}".format(day)] = date_json
			dateObj = tournament.date
			year = dateObj.year
			month = dateObj.month
			day = dateObj.day
			date_json = {}
			i = 0
		date_json[i] = {
			'type' : 'tournament',
			'id' : tournament.pk,
			'date' : tournament.date,
		}
		i += 1
		total_count += 1
		for match in tournament.matches.all():
			if match.player_one.username == username or match.player_two.username == username:
				if (max != -1 and total_count >= max):
					break
				try:
					p1_name = match.player_one.username
					p1_display_name = match.player_one.profile.display_name
					if (match.player_one.profile.blocked_users.filter(pk=user_origin.pk)).exists():
						p1_name = "deleted"
						p1_display_name = "deleted"

				except:
					p1_name = "deleted"
					p1_display_name = "deleted"

				try:
					p2_name = match.player_two.username
					p2_display_name = match.player_two.profile.display_name
					if (match.player_two.profile.blocked_users.filter(pk=user_origin.pk)).exists():
						p2_name = "deleted"
						p2_display_name = "deleted"
				except:
					p2_name = "deleted"
					p2_display_name = "deleted"
				date_json[i] = {
					'type' : 'match',
					'player_one' : p1_name,
					'player_two' : p2_name,
					'player_one_display_name' : p1_display_name,
					'player_two_display_name' : p2_display_name,
					'player_one_pts' : match.player_one_pts,
					'player_two_pts' : match.player_two_pts,
					'winner' : match.winner.profile.display_name,
					'date' : match.date,
					'id' : match.pk
				}
				i += 1
				total_count += 1
	i = 0

	if (dateObj != ""):
		month_json["{0}".format(day)] = date_json
		year_json["{0}".format(month)] = month_json
		matches_json["{0}".format(year)] = year_json
	dateObj = ""
	year = ""
	month = ""
	day = ""
	date_json = {}
	for match in matches:
		if (max != -1 and total_count >= max):
			break
		if (dateObj != match.date):
			if (year != ""):
				if (year != match.date.year):
					matches_json["{0}".format(year)] = year_json
					#year_json = {}
				if (month != match.date.month):
					year_json["{0}".format(month)] = month_json
					#month_json = {}
				if (day != match.date.day):
					month_json["{0}".format(day)] = date_json
			dateObj = match.date
			year = dateObj.year
			month = dateObj.month
			day = dateObj.day
			try :
				date_json = matches_json["{0}".format(year)]["{0}".format(month)]["{0}".format(day)]
			except:
				date_json = {}
			i = 0
		try:
			p1_name = match.player_one.username
			if (match.player_one.profile.blocked_users.filter(pk=user_origin.pk)).exists():
				p1_name = "deleted"
		except:
			p1_name = "deleted"

		try:
			p2_name = match.player_two.username
			if (match.player_two.profile.blocked_users.filter(pk=user_origin.pk)).exists():
				p2_name = "deleted"
		except:
			p2_name = "deleted"
		while (i in date_json):
			i += 1
		date_json[i] = {
			'type' : 'match',
			'player_one' : p1_name,
			'player_two' : p2_name,
			'player_one_display_name' : p1_name,
			'player_two_display_name' : p2_name,
			'player_one_pts' : match.player_one_pts,
			'player_two_pts' : match.player_two_pts,
			'winner' : match.winner.profile.display_name,
			'date' : match.date,
			'id' : match.pk
		}
		total_count += 1
		i += 1
	if (dateObj != ""):
		month_json["{0}".format(day)] = date_json
		year_json["{0}".format(month)] = month_json
		matches_json["{0}".format(year)] = year_json
	return matches_json

def get_user_json(user_origin, user, startDate, endDate):
	matches = get_user_match_json(
		user_origin,
		user.profile.matches.order_by("date").filter(date__range=(startDate, endDate)),
		user.profile.tournaments.order_by("date").filter(date__range=(startDate, endDate)),
		user.username)
	return {'username' : user.username,
		'pfp' : user.profile.profile_picture,
		'is_active' : user.profile.is_active,
		'display_name' : user.profile.display_name,
		'matches' : matches
	}

def get_user_preview_json(user):
	return {'username' : user.username,
		'pfp' : user.profile.profile_picture,
		'is_active' : user.profile.is_active,
	}

def current_user(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)

	friends_list = request.user.profile.friends.all()
	friends_request_list = request.user.profile.friends_request.all()
	blocked_list = request.user.profile.blocked_users.all()
	friend_json = {}
	friend_request_json = {}
	blocked_json = {}

	for e in friends_list:
		friend_json[e.username] = get_user_preview_json(e)
	for e in friends_request_list:
		friend_request_json[e.username] = get_user_preview_json(e)
	for e in blocked_list:
		blocked_json[e.username] = get_user_preview_json(e)

	matches = get_user_match_json(
		request.user,
		request.user.profile.matches.filter(date=datetime.date.today()),
		request.user.profile.tournaments.filter(date=datetime.date.today()),
		request.user.username, 5)

	return JsonResponse({'username': request.user.username,
		'theme_name' : request.user.profile.theme_name,
		'pfp': request.user.profile.profile_picture,
		'lang': request.user.profile.language_pack,
		'friends': friend_json,
		'friend_requests': friend_request_json,
		'blocked_users': blocked_json,
		'is_active': request.user.profile.is_active,
		'matches' : matches,
		'is_admin' : request.user.is_staff,
		'font_amplifier' : request.user.profile.font_amplifier,
		'do_not_disturb' : request.user.profile.do_not_disturb,
		'display_name': request.user.profile.display_name
	})

def get(request):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)

	try:
		data = json.loads(request.body)

		username = data['name']
		startDate = data['startDate']
		endDate = data['endDate']

		if not username or not startDate or not endDate or \
			not isinstance(username, str) or not isinstance(startDate, str) or not isinstance(endDate, str):
			return JsonResponse({'message':  "Invalid Data: " + str(request.body)}, status=400)

		datetime.datetime.strptime(startDate, '%Y-%m-%d')
		datetime.datetime.strptime(endDate, '%Y-%m-%d')

		user = User.objects.get(username=username)
		if (user.profile.blocked_users.filter(pk=request.user.pk)).exists():
			return JsonResponse({'message': "can't find user"}, status=403)

		response = get_user_json(request.user, user, startDate, endDate)

		return JsonResponse(response, status=200)
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
	except (KeyError, ValueError):
		return JsonResponse({'message':  "Missing Data: " + str(request.body)}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'message': "can't find user"}, status=404)
	except DatabaseError:
		return JsonResponse({'message':  "Database error"}, status=500)
	except Exception:
		return JsonResponse({'message':  "Internal server error"}, status=500)

def search_by_username(request):
	if (request.method != 'POST'):
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)

	users_json = {}

	try:
		data = json.loads(request.body)
		name = data['name']

		if not name or not isinstance(name, str):
			return JsonResponse({'message': 'Invalid name'}, status=400)

		query_users = User.objects.filter(username__icontains=name)
		if not query_users:
			return JsonResponse({}, status=200)

		for user in query_users:
			if not (user.profile.blocked_users.filter(pk=request.user.pk)).exists():
				users_json[user.username] = get_user_preview_json(user)

		return JsonResponse(users_json, status=200)

	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

	except KeyError:
		return JsonResponse({'message': 'Missing data'}, status=400)

	except Exception:
		return JsonResponse({'message': 'Internal server error'}, status=500)

def get_user_id(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request method'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': 'Client is not logged'}, status=401)

	try:
		data = json.loads(request.body)
		username = data["username"]

		if not username or not isinstance(username, str):
			return JsonResponse({'message': 'Invalid username'}, status=400)

		user = User.objects.get(username=username)

		if (user.profile.blocked_users.filter(pk=request.user.pk)).exists():
			return JsonResponse({'message': 'User blocked you', 'blocked': True}, status=200)
		return JsonResponse({'id': user.id, 'self_id' : request.user.id, 'blocked': False}, status=200)

	except KeyError:
		return JsonResponse({'message': 'Missing data'}, status=400)

	except User.DoesNotExist:
		return JsonResponse({'message': 'User not found'}, status=404)

	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

	except Exception:
		return JsonResponse({'message': 'Internal server error'}, status=500)

def get_tournament(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request method'}, status=405)

	try:
		data = json.loads(request.body)
		id = data["id"]

		if not id or not isinstance(id, int):
			return JsonResponse({'message': 'Invalid id'}, status=400)

		tournament = gameModels.TournamentModel.objects.get(pk=id)
		tournamentJson = {
			"round_0" : {
				"match_0" : {
					"playerLeft":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					},
					"playerRight":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					}
				},
				"match_1" : {
					"playerLeft":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					},
					"playerRight":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					}
				},
				"match_2" : {
					"playerLeft":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					},
					"playerRight":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					}
				},
				"match_3" : {
					"playerLeft":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					},
					"playerRight":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					}
				}
			},
			"round_1" : {
				"match_0" : {
					"playerLeft":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					},
					"playerRight":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					}
				},
				"match_1" : {
					"playerLeft":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					},
					"playerRight":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					}
				}
			},
			"round_2" : {
				"match_0" : {
					"playerLeft":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					},
					"playerRight":{
						"username": None,
						"display_name": None,
						"profile_picture": None,
						"winner": None,
						"score": 0,
					}
				}
			}
		}
		for match in tournament.matches.all():
			if (match.player_one.profile.blocked_users.filter(pk=request.user.pk)).exists():
				match.player_one = User.objects.get(username="nobody")
			p1_name = match.player_one.username
			p1_pfp = match.player_one.profile.profile_picture
			p1_display_name = match.player_one.profile.display_name

			if (match.player_two.profile.blocked_users.filter(pk=request.user.pk)).exists():
				match.player_two = User.objects.get(username="nobody")
			p2_name = match.player_two.username
			p2_pfp = match.player_two.profile.profile_picture
			p2_display_name = match.player_two.profile.display_name

			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["username"] = p1_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["display_name"] = p1_display_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["profile_picture"] = p1_pfp
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["winner"] = "left" if match.winner.username == match.player_one.username else None
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["score"] = match.player_one_pts

			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["username"] = p2_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["display_name"] = p2_display_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["profile_picture"] = p2_pfp
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["winner"] = "right" if match.winner.username == match.player_two.username else None
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["score"] = match.player_two_pts

			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["id"] = match.pk
		return JsonResponse(tournamentJson, status=200)

	except gameModels.TournamentModel.DoesNotExist:
		return JsonResponse({'message': 'Tournament not found'}, status=404)

	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

	except KeyError:
		return JsonResponse({'message': 'Missing data'}, status=400)

	except Exception as e:
		return JsonResponse({'message': str(e)}, status=500)

def get_match(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request method'}, status=405)

	try:
		data = json.loads(request.body)
		id = data["id"]

		if not id or not isinstance(id, int):
			return JsonResponse({'message': 'Invalid id'}, status=400)

		match = gameModels.Match.objects.get(pk=id)

		if (match.player_one.profile.blocked_users.filter(pk=request.user.pk)).exists():
			match.player_one = User.objects.get(username="nobody")
		p1_name = match.player_one.username
		p1_pfp = match.player_one.profile.profile_picture
		p1_display_name = match.player_one.profile.display_name

		if (match.player_two.profile.blocked_users.filter(pk=request.user.pk)).exists():
			match.player_two = User.objects.get(username="nobody")
		p2_name = match.player_two.username
		p2_pfp = match.player_two.profile.profile_picture
		p2_display_name = match.player_two.profile.display_name


		match_json = {
			'player_one' : p1_name,
			'player_one_display_name' : p1_display_name,
			'player_one_profile_picture' : p1_pfp,
			'player_two' : p2_name,
			'player_two_display_name' : p2_display_name,
			'player_two_profile_picture' : p2_pfp,
			'player_one_pts' : match.player_one_pts,
			'player_two_pts' : match.player_two_pts,
			'exchanges' : match.exchanges,
			'exchangesMax' : match.exchangesMax,
			'player_one_goals_up' : match.player_one_goals_up,
			'player_two_goals_up' : match.player_two_goals_up,
			'player_one_goals_mid' : match.player_one_goals_mid,
			'player_two_goals_mid' : match.player_two_goals_mid,
			'player_one_goals_down' : match.player_one_goals_down,
			'player_two_goals_down' : match.player_two_goals_down,
			'winner' : match.winner.username,
			'date' : match.date,
		}

		return JsonResponse(match_json, status=200)

	except gameModels.Match.DoesNotExist:
		return JsonResponse({'message': 'Tournament not found'}, status=404)

	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

	except KeyError:
		return JsonResponse({'message': 'Missing data'}, status=400)

	except Exception:
		return JsonResponse({'message': 'Internal server error'}, status=500)
