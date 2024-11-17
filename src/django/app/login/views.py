import json, os, requests, base64, random, string, datetime,zxcvbn, re, io
import game.models as gameModels
from django.contrib.auth import login, authenticate, logout
from django.db import DatabaseError
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.core.validators import RegexValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
from transcendence.settings import DEBUG
from PIL import Image

def getClientId(request):
	clientId = os.getenv('API_42_PUBLIC')
	if not clientId:
		return JsonResponse({'message': 'Client ID not set'}, status=500)
	return JsonResponse({'clientId': clientId})

def fortytwo(request):
	create_ai()
	create_nobody()
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=405)

	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

	code = data.get('code')
	if not code:
		return JsonResponse({'message': 'Invalid request Code'}, status=400)
	hostname = data.get('hostname')
	if not hostname:
		return JsonResponse({'message': 'Invalid request Hostname'}, status=400)
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
		return JsonResponse({'message': 'Failed to retrieve access token'}, status=500)
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

	username = re.sub(r'\W+', '', user_login)
	user_login = username[:8]

	id42 = user_json.get('id')
	if not user_login or id42 is None:
		return JsonResponse({'message': 'Failed to retrieve user data'}, status=500)
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

def create_user(request):
	create_ai()
	create_nobody()
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=405)
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

	try:
		username = data['username']
		password = data['password']
	except Exception as e:
		return JsonResponse({'message': str(e)}, status=500)

	if username is None or password is None:
		return JsonResponse({'message': 'Invalid request'}, status=405)

	username_validator = RegexValidator(regex=r'^[\w-]+$', message='Username must be alphanumeric')
	max_length_validator = MaxLengthValidator(15, message='Username must be 15 characters or fewer')
	try:
		username_validator(username)
		max_length_validator(username)
	except ValidationError as e:
		return JsonResponse({'message': e.message}, status=400)

	if len(password) > 128:
		return JsonResponse({'message': 'Password too long'}, status=400)
	if len(password) == 0:
		return JsonResponse({'message': 'Password too short'}, status=400)
	result = zxcvbn.zxcvbn(password)
	if result['score'] < 4 and not DEBUG:
		return JsonResponse({'message': 'Password too weak'}, status=400)

	if User.objects.filter(username=username).exists():
		return JsonResponse({'message': 'User with same username already exist'}, status=400)

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
		if 'lang' in data:
			user.profile.language_pack = data['lang']
		if 'use_browser_theme' in data:
			user.profile.use_browser_theme = data['use_browser_theme']
		user.save()
		user = authenticate(request, username=username, password=password)
		return JsonResponse({'message': 'User created'}, status=201)
	except DatabaseError:
		return JsonResponse({'message': 'Database error'}, status=500)
	except Exception as e:
		return JsonResponse({'message': str(e)}, status=500)

def create_ai():
	if User.objects.filter(username="AI").exists():
		return
	username = "AI"
	password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=200))
	user = User.objects.create_user(username=username, password=password)
	user.profile.profile_picture = "/images/defaults/defaultAi.gif"
	user.id42 = 0
	user.save()

def create_nobody():
	if User.objects.filter(username="Nobody").exists():
		return User.objects.get(username="Nobody")
	username = "Nobody"
	password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=200))
	user = User.objects.create_user(username=username, password=password)
	user.profile.profile_picture = "/images/defaults/thisman.jpg"
	user.id42 = 0
	user.save()
	return user

def user_login(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=405)
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

	try :
		username = data.get('username')
		password = data.get('password')
	except Exception as e:
		return JsonResponse({'message': str(e)}, status=500)

	if not username or not password:
		return JsonResponse({'message': 'Username and password are required'}, status=400)
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
	except Exception as e:
		return JsonResponse({'message': str(e)}, status=500)

def user_logout(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if (request.user.is_authenticated):
		request.user.profile.is_active = False
		request.user.save()
		logout(request)
		return JsonResponse({'message': 'logged out'}, status=200)
	else:
		return JsonResponse({'message': "Client is not logged"}, status=401)

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

def profile_update(request):
	if (request.user.is_authenticated):
		if (request.method == 'POST'):
			try:
				valid = False
				data = json.loads(request.body)
				user = request.user
				if "is_dark_theme" in data:
					valid = True
					if (isinstance(data['is_dark_theme'], (bool))):
						user.profile.dark_theme = data['is_dark_theme']
					else:
						return JsonResponse({'message': 'Invalid is_dark_theme value, should be a boolean'}, status=400)
				if "username" in data:
					valid = True
					if (isinstance(data['username'], (str))):
						if User.objects.filter(username=data['username']).exists():
							return JsonResponse({'message': 'Username is already taken'}, status=400)
						user.username = data['username']
					else:
						return JsonResponse({'message': 'Invalid username value, should be a string'}, status=400)
					username_validator = RegexValidator(regex=r'^[\w-]+$', message='Username must be alphanumeric')
					max_length_validator = MaxLengthValidator(15, message='Username must be 15 characters or fewer')
					try:
						username_validator(user.username)
						max_length_validator(user.username)
					except ValidationError as e:
						return JsonResponse({'message': e.message}, status=400)
				if "display_name" in data:
					valid = True
					if (isinstance(data['display_name'], (str))):
						if User.objects.filter(profile__display_name=data['display_name']).exists():
							return JsonResponse({'message': 'Display name is already taken'}, status=400)
						user.profile.display_name = data['display_name']
					else:
						return JsonResponse({'message': 'Invalid display name value, should be a string'}, status=400)
					display_name_validator = RegexValidator(regex=r'^[\w-]+$', message='Display name must be alphanumeric')
					max_length_validator = MaxLengthValidator(15, message='Display name must be 15 characters or fewer')
					try:
						display_name_validator(user.profile.display_name)
						max_length_validator(user.profile.display_name)
					except ValidationError as e:
						return JsonResponse({'message': e.message}, status=400)
					user.profile.save()
				if "pfp" in data:
					valid = True
					if (isinstance(data['pfp'], (str, bytearray))):
						if user.profile.profile_picture and os.path.exists(user.profile.profile_picture) and user.profile.profile_picture.find("/defaults/") == -1:
							os.remove(user.profile.profile_picture)
						try:
							image_data = base64.b64decode(data['pfp'])
							image = Image.open(io.BytesIO(image_data))
							image.verify()

							image = Image.open(io.BytesIO(image_data))

							if image.format not in ['JPEG', 'PNG', 'GIF']:
								return JsonResponse({'message': 'Image format not supported, use JPEG, PNG or GIF'}, status=400)
						except:
							return JsonResponse({'message': 'Invalid base64 string'}, status=400)
						pfpName = "/images/{0}.jpg".format(user.username)
						with open(pfpName, "wb", opener=file_opener) as f:
							f.write(image_data)
						user.profile.profile_picture = pfpName
					else:
						return JsonResponse({'message': 'Invalid pfp value, should be a string'}, status=400)
				if ("language_pack" in data):
					valid = True
					if (isinstance(data['language_pack'], (str))):	#TODO check if path is valid
						user.profile.language_pack = data['language_pack']
					else:
						return JsonResponse({'message': 'Invalid language_pack value, should be a string'}, status=400)
				if ("is_active" in data):
					valid = True
					if (isinstance(data['is_active'], (bool))):
						user.profile.is_active = data['is_active']
					else:
						return JsonResponse({'message': 'Invalid is_active value, should be a boolean'}, status=400)
				if ("font_amplifier" in data):
					valid = True
					if (isinstance(data['font_amplifier'], (float, int))):
						user.profile.font_amplifier = data['font_amplifier']
					else:
						return JsonResponse({'message': 'Invalid font_amplifier value, should be a float'}, status=400)
				if ("use_browser_theme" in data):
					valid = True
					if (isinstance(data['use_browser_theme'], (bool))):
						user.profile.use_browser_theme = data['use_browser_theme']
					else:
						return JsonResponse({'message': 'Invalid use_browser_theme value, should be a boolean'}, status=400)
				if ("theme_name" in data):
					valid = True
					if (isinstance(data['theme_name'], (str))):
						max_length_validator = MaxLengthValidator(10, message='Theme_name must be 10 characters or fewer')
						try:
							max_length_validator(data['theme_name'])
						except ValidationError as e:
							return JsonResponse({'message': e.message}, status=400)
						user.profile.theme_name = data['theme_name']
					else:
						return JsonResponse({'message': 'Invalid theme_name value, should be a string'}, status=400)
				if ("do_not_disturb" in data):
					valid = True
					if (isinstance(data['do_not_disturb'], (bool))):
						user.profile.do_not_disturb = data['do_not_disturb']
					else:
						return JsonResponse({'message': 'Invalid do_not_disturb value, should be a boolean'}, status=400)
				if (valid == False):
					return JsonResponse({'message': 'Field does not exist'}, status=400)

				user.save()
				return JsonResponse({'message': 'User profile updated'}, status=200)
			except json.JSONDecodeError:
				return JsonResponse({'message': 'Invalid JSON'}, status=400)
	else:
		return JsonResponse({'message': "Client is not logged"}, status=401)

def get_user_match_json(matches, tournaments, username, max=-1):
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
				except:
					p1_name = "deleted"
					p1_display_name = "deleted"

				try:
					p2_name = match.player_two.username
					p2_display_name = match.player_two.profile.display_name
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
			p1_display_name = match.player_one.profile.display_name
		except:
			p1_name = "deleted"
			p1_display_name = "deleted"

		try:
			p2_name = match.player_two.username
			p2_display_name = match.player_two.profile.display_name
		except:
			p2_name = "deleted"
			p2_display_name = "deleted"
		while (i in date_json):
			i += 1
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
		total_count += 1
		i += 1
	if (dateObj != ""):
		month_json["{0}".format(day)] = date_json
		year_json["{0}".format(month)] = month_json
		matches_json["{0}".format(year)] = year_json
	return matches_json

def get_user_json(user, startDate, endDate):
	matches = get_user_match_json(
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
	if request.user.is_authenticated:
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
			request.user.profile.matches.filter(date=datetime.date.today()),
			request.user.profile.tournaments.filter(date=datetime.date.today()),
			request.user.username, 5)
		return JsonResponse({'username': request.user.username,
			'is_dark_theme': request.user.profile.dark_theme,
			'use_browser_theme': request.user.profile.use_browser_theme,
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
	else:
		return JsonResponse({'message': "Client is not logged"}, status=401)

def get(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		try:
			return JsonResponse(get_user_json(User.objects.get(username=data['name']), data['startDate'], data['endDate']), status=200)
		except User.DoesNotExist:
			return JsonResponse({'message': "can't find user"}, status=404)
		except Exception as error:
			return JsonResponse({'message': error}, status=500)
	else:
		return JsonResponse({'message': "Client is not logged"}, status=401)

def search_by_username(request):
	if (request.method != 'POST'):
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		users_json = {}
		try:
			query_users = User.objects.filter(username__icontains=data['name'])
			i = 0
			for user in query_users:
				users_json[i] = get_user_preview_json(user)
				i += 1
			if i == 0:
				return JsonResponse({}, status=200)
			return JsonResponse(users_json, status=200)
		except Exception as error:
			return JsonResponse({'message': error}, status=500)
	else:
		return JsonResponse({'message': "Client is not logged"}, status=401)

def get_user_id(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request method'}, status=405)

	try:
		data = json.loads(request.body)
		username = data.get("user")

		if not username:
			return JsonResponse({'message': 'Username is required'}, status=400)
		user = User.objects.get(username=username)

		if (user.profile.blocked_users.filter(pk=request.user.pk)).exists():
			return JsonResponse({'message': 'User blocked you', 'blocked': True}, status=200)
		return JsonResponse({'id': user.id, 'self_id' : request.user.id, 'blocked': False}, status=200)

	except User.DoesNotExist:
		return JsonResponse({'message': 'User not found'}, status=404)

	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

def get_tournament(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request method'}, status=405)

	try:
		data = json.loads(request.body)
		tournament = gameModels.TournamentModel.objects.get(pk=data.get("id"))
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

			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["username"] = match.player_one.username
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["display_name"] = match.player_one.profile.display_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["profile_picture"] = match.player_one.profile.profile_picture
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["winner"] = "left" if match.winner.username == match.player_one.username else None
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["score"] = match.player_one_pts

			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["username"] = match.player_two.username
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["display_name"] = match.player_two.profile.display_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["profile_picture"] = match.player_two.profile.profile_picture
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["winner"] = "right" if match.winner.username == match.player_two.username else None
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["score"] = match.player_two_pts

			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["id"] = match.pk
		return JsonResponse(tournamentJson, status=200)
#	except gameModels.DoesNotExist:
#		return JsonResponse({'message': 'Tournament not found'}, status=404)

	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

def get_match(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request method'}, status=405)

	try:
		data = json.loads(request.body)
		match = gameModels.Match.objects.get(pk=data.get("id"))
		try:
			p1_name = match.player_one.username
			p1_pfp = match.player_one.profile.profile_picture
			p1_display_name = match.player_one.profile.display_name
		except:
			p1_name = "deleted"
			p1_pfp = ""
			p1_display_name = "deleted"

		try:
			p2_name = match.player_two.username
			p2_pfp = match.player_two.profile.profile_picture
			p2_display_name = match.player_two.profile.display_name
		except:
			p2_name = "deleted"
			p2_pfp = ""
			p2_display_name = "deleted"

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
#	except gameModels.DoesNotExist:
#		return JsonResponse({'message': 'Tournament not found'}, status=404)

	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

