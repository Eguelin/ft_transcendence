import json, os, requests, base64, random, string, datetime, re, io
import game.models as gameModels
from django.contrib.auth import login, authenticate, logout
from django.db import DatabaseError
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.core.validators import RegexValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
from transcendence.settings import DEBUG
from PIL import Image
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

NOT_USER = ['nobody', 'deleted', 'blocked']

def getClientId(request):
	clientId = os.getenv('API_42_PUBLIC')
	if not clientId:
		return JsonResponse({'message': 'Client ID not set'}, status=400)
	return JsonResponse({'clientId': clientId})

def fortytwo(request):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)

	try:
		data = json.loads(request.body)
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
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
		return JsonResponse({'message': "Invalid response from 42 API, try again later"}, status=400)

	access_token = response.json().get('access_token', None)
	if not access_token:
		return JsonResponse({'message': "Invalid response from 42 API, try again later"}, status=400)

	url = 'https://api.intra.42.fr/v2/me'
	headers = {
		'Authorization': f'Bearer {access_token}'
	}
	response = requests.get(url, headers=headers)
	if response.status_code != 200:
		return JsonResponse(response.json(), status=response.status_code)

	user_json = response.json()
	try:
		user_login = user_json['login']
		id42 = user_json['id']
	except KeyError:
		return JsonResponse({'message': "Invalid response from 42 API, try again later"}, status=400)

	pfp_url = user_json.get('image', {}).get('versions', {}).get('small', '/images/defaults/default{0}.jpg'.format(random.randint(0, 2)))
	lang = user_json.get('languages_users', [{}])[0].get('language_id', 2)

	if lang == 1:
		lang = 'FR_FR'
	elif lang == 2:
		lang = 'EN_UK'
	elif lang == 16:
		lang = 'IT_IT'
	elif lang == 21:
		lang = 'DE_GE'

	username = re.sub(r'\W+', '', user_login)
	user_login = username[:8]

	try:
		user = User.objects.get(profile__id42=id42)
		user = authenticate(request, username=user.username, password=str(id42))
		if user is not None:
			user.save()
			login(request, user)
			return JsonResponse({'message': 'User logged in', 'content': pfp_url}, status=200)
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=401)
	except User.DoesNotExist:
		username = user_login
		for i in range(100):
			if not User.objects.filter(username=username).exists():
				break
			username = user_login[:8] + '_' + ''.join(random.choices(string.ascii_lowercase + string.ascii_uppercase + string.digits, k=6))
		if User.objects.filter(username=username).exists():
			return JsonResponse({'message': 'Too many users with the same username, try again later'}, status=400)

		user = User.objects.create_user(username=username)

		display_name = username
		for i in range(100):
			if not User.objects.filter(profile__display_name=display_name).exists():
				break
			display_name = username[:8] + '_' + ''.join(random.choices(string.ascii_lowercase + string.ascii_uppercase + string.digits, k=6))
		if User.objects.filter(profile__display_name=display_name).exists():
			return JsonResponse({'message': 'Too many users with the same display name, try again later'}, status=400)

		user.set_password(str(id42))
		user.profile.profile_picture = pfp_url
		user.profile.id42 = id42
		user.profile.display_name = display_name
		user.profile.language_pack = lang
		user.save()

		user = authenticate(request, username=user.username, password=str(id42))
		if user is not None:
			login(request, user)
			return JsonResponse({'message': 'User created and logged in', 'pfp': pfp_url})
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=401)

def check_username(username, display_name=False):
	if not username or not isinstance(username, str):
		return False, 'Invalid username'

	username_validator = RegexValidator(regex=r'^[\w-]+$', message='Username must be alphanumeric')
	max_length_validator = MaxLengthValidator(15, message='Username must be 15 characters or fewer')

	try:
		username_validator(username)
		max_length_validator(username)
	except ValidationError as e:
		return False, e.message

	if not display_name and User.objects.filter(username=username).exists():
		return False, 'Username already taken'
	elif display_name and User.objects.filter(profile__display_name=username).exists():
		return False, 'Display name already taken'

	return True, None

def check_password(password, staff=False):
	if not password or not isinstance(password, str):
		return False, 'Invalid password'

	if len(password) > 128:
		return False, 'Password too long (max 128 characters)'
	if len(password) == 0:
		return False, 'empty password'

	if DEBUG or staff:
		return True, None

	if len(password) < 8:
		return False, 'Password too short (min 8 characters)'

	if not any(c.isupper() for c in password):
		return False, 'Password must contain at least one uppercase letter'
	if not any(c.islower() for c in password):
		return False, 'Password must contain at least one lowercase letter'
	if not any(c.isdigit() for c in password):
		return False, 'Password must contain at least one digit'
	if not any(c in string.punctuation for c in password):
		return False, 'Password must contain at least one special character'

	return True, None

def create_user(request, staff=False):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)

	try:
		data = json.loads(request.body)
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
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

	valid, message = check_language_pack(language)
	if not valid:
		return JsonResponse({'message': message}, status=400)

	valid, message = check_theme_name(theme_name)
	if not valid:
		return JsonResponse({'message': message}, status=400)

	display_name = username
	for i in range(100):
		if not User.objects.filter(profile__display_name=display_name).exists():
			break
		display_name = username[:8] + '_' + ''.join(random.choices(string.ascii_lowercase + string.ascii_uppercase + string.digits, k=6))
	if User.objects.filter(profile__display_name=display_name).exists():
		return JsonResponse({'message': 'Too many users with the same display name, try again later'}, status=400)

	try:
		user = User.objects.create_user(username=username, password=password)
		user.profile.profile_picture = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))
		user.profile.id42 = 0
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

def create_deleted_user():
	return create_npc("deleted", "deleted.jpg")

def create_default_users():
	create_npc("AI", "ai.gif")
	create_npc("nobody", "nobody.jpg")
	create_npc("deleted", "deleted.jpg")
	create_npc("blocked", "blocked.jpg")
	create_npc(os.getenv('DJANGO_ADMIN_USER'), "admin.jpg", os.getenv('DJANGO_ADMIN_PASSWORD'), True)

def create_npc(name, pfp, password=None, staff=False):
	if User.objects.filter(username=name).exists():
		return User.objects.get(username=name)
	username = name
	if not password:
		password = ''.join(random.choices(string.ascii_lowercase + string.digits, k=200))
	user = User.objects.create_user(username=username, password=password)
	user.profile.profile_picture ="/images/defaults/" + pfp
	user.profile.display_name = name
	user.id42 = 0
	user.is_staff = staff
	user.save()
	return user

def user_login(request):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)

	try:
		data = json.loads(request.body)
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
		username = data['username']
		password = data['password']
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
	except KeyError:
		return JsonResponse({'message':  "Missing Data: " + str(request.body)}, status=400)

	if not username or not password or not isinstance(username, str) or not isinstance(password, str):
		return JsonResponse({'message':  "Invalid Data: " + str(request.body)}, status=400)

	if username in NOT_USER or username == "AI":
		return JsonResponse({'message': "User not found"}, status=404)

	if len(password) > 128:
		return JsonResponse({'message': 'Password too long (max 128 characters)'}, status=400)

	try:
		user = User.objects.get(username=username)

		if user.profile.id42 != 0:
			return JsonResponse({'message': 'Forbidden'}, status=403)

		user = authenticate(request, username=username, password=password)
		if user is not None:
			user.save()
			login(request, user)
			return JsonResponse({'message': 'User logged in'}, status=200)
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'message': "User not found"}, status=404)
	except DatabaseError:
		return JsonResponse({'message':  "Database error"}, status=500)
	except Exception:
		return JsonResponse({'message':  "Internal server error"}, status=500)

def user_logout(request):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message':  "Client is not logged"}, status=401)

	socket_end(request.user)
	request.user.save()
	logout(request)

	return JsonResponse({'message':  'logged out'}, status=200)

def delete_user(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)
	try:
		socket_end(request.user)
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

		if image.format not in ['JPEG', 'PNG', 'GIF']:
			return False, 'Image format not supported, use JPEG, PNG or GIF'
	except:
		return False, 'Invalid base64 string'

	if os.path.exists(user.profile.profile_picture) and user.profile.profile_picture.find("/defaults/") == -1:
		os.remove(user.profile.profile_picture)

	pfpName = f"/images/{user.username}_{''.join(random.choices(string.ascii_lowercase + string.ascii_uppercase + string.digits, k=6))}.{image.format.lower()}"
	with open(pfpName, "wb", opener=file_opener) as f:
		f.write(image_data)

	user.profile.profile_picture = pfpName
	return True, None

def check_language_pack(language):
	languages = ["DE_GE", "EN_UK", "FR_FR", "IT_IT"]
	if not language or not isinstance(language, str):
		return False, 'Invalid language_pack value, should be a string'
	if language not in languages:
		return False, "Invalid language_pack value, should be 'DE_GE', 'EN_UK', 'FR_FR' or 'IT_IT"
	return True, None

def check_theme_name(theme):
	themes = ["dark", "light", "high_dark", "high_light", "browser"]
	if not theme or not isinstance(theme, str):
		return False, 'Invalid theme_name value, should be a string'
	if theme not in themes:
		return False, "Invalid theme_name value, should be 'dark', 'light', 'high_dark', 'high_light' or 'browser'"
	return True, None

def profile_update(request):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)

	valid = False
	try:
		data = json.loads(request.body)
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)

	user = request.user

	if "do_not_disturb" in data:
		valid = True
		do_not_disturb = data["do_not_disturb"]
		if not isinstance(do_not_disturb, bool):
			return JsonResponse({'message': 'Invalid do_not_disturb value, should be a boolean'}, status=400)
		user.profile.do_not_disturb = do_not_disturb

	if "password" in data:
		if "old_password" not in data:
			return JsonResponse({'message': "Old password not provided"}, status=400)

		password = data['password']
		old_password = data['old_password']

		if not password or not old_password or not isinstance(password, str) or not isinstance(old_password, str):
			return JsonResponse({'message': 'Invalid data'}, status=400)

		if user.profile.id42 != 0:
			return JsonResponse({'message': "Remote password change forbiden"}, status=403)

		valid, message = check_password(password)
		if not valid :
			return JsonResponse({'message': message}, status=400)

		if not user.check_password(old_password):
			return JsonResponse({'message': 'Old password mismatch'}, status=400)

		user.set_password(password)
		user.save()
		login(request, user)

	if "username" in data:
		valid, message = check_username(data['username'])
		if not valid:
			return JsonResponse({'message': message}, status=400)
		user.username = data['username']

	if "display_name" in data:
		valid, message = check_username(data['display_name'], True)
		if not valid:
			return JsonResponse({'message': message}, status=400)
		user.profile.display_name = data['display_name']

	if "pfp" in data:
		valid, message = set_pfp(user, data['pfp'])
		if not valid:
			return JsonResponse({'message': message}, status=400)

	if ("language_pack" in data):
		valid, message = check_language_pack(data['language_pack'])
		if not valid:
			return JsonResponse({'message': message}, status=400)
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
		valid, message = check_theme_name(data['theme_name'])
		if not valid:
			return JsonResponse({'message': message}, status=400)
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
				if (year != match.date.year and month != match.date.month and day != match.date.day):
					month_json["{0}".format(day)] = date_json
					date_json = {}
					year_json["{0}".format(month)] = month_json
					month_json = {}
					matches_json["{0}".format(year)] = year_json
					year_json = {}
				elif (month != match.date.month and day != match.date.day):
					month_json["{0}".format(day)] = date_json
					date_json = {}
					year_json["{0}".format(month)] = month_json
					month_json = {}
				else:
					if (year != match.date.year):
						matches_json["{0}".format(year)] = year_json
						year_json = {}
					if (month != match.date.month):
						year_json["{0}".format(month)] = month_json
						month_json = {}
					if (day != match.date.day):
						month_json["{0}".format(day)] = date_json
						date_json = {}
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

				if (match.player_one.profile.blocked_users.filter(pk=user_origin.pk)).exists():
					match.player_one = User.objects.get(username="blocked")
				p1_name = match.player_one.username
				p1_display_name = match.player_one.profile.display_name

				if (match.player_two.profile.blocked_users.filter(pk=user_origin.pk)).exists():
					match.player_two = User.objects.get(username="blocked")
				p2_name = match.player_two.username
				p2_display_name = match.player_two.profile.display_name

				date_json[i] = {
					'type' : 'match',
					'player_one' : p1_name,
					'player_two' : p2_name,
					'player_one_display_name' : p1_display_name,
					'player_two_display_name' : p2_display_name,
					'player_one_pts' : match.player_one_pts,
					'player_two_pts' : match.player_two_pts,
					'winner' : match.winner.username,
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
				if (year != match.date.year and month != match.date.month and day != match.date.day):
					month_json["{0}".format(day)] = date_json
					date_json = {}
					year_json["{0}".format(month)] = month_json
					month_json = {}
					matches_json["{0}".format(year)] = year_json
					year_json = {}
				elif (month != match.date.month and day != match.date.day):
					month_json["{0}".format(day)] = date_json
					date_json = {}
					year_json["{0}".format(month)] = month_json
					month_json = {}
				else:
					if (year != match.date.year):
						matches_json["{0}".format(year)] = year_json
						year_json = {}
					if (month != match.date.month):
						year_json["{0}".format(month)] = month_json
						month_json = {}
					if (day != match.date.day):
						month_json["{0}".format(day)] = date_json
						date_json = {}
			dateObj = match.date
			year = dateObj.year
			month = dateObj.month
			day = dateObj.day
			try :
				date_json = matches_json["{0}".format(year)]["{0}".format(month)]["{0}".format(day)]
			except:
				date_json = {}
			i = 0

		if (match.player_one.profile.blocked_users.filter(pk=user_origin.pk)).exists():
			match.player_one = User.objects.get(username="blocked")
		p1_name = match.player_one.username

		if (match.player_two.profile.blocked_users.filter(pk=user_origin.pk)).exists():
			match.player_two = User.objects.get(username="blocked")
		p2_name = match.player_two.username

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
			'winner' : match.winner.username,
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
		'id' : user.id,
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
		'display_name': request.user.profile.display_name,
		'id' : request.user.id,
		'remote_auth' : 1 if request.user.profile.id42 != 0 else 0
	})

def get(request):
	if request.method != 'POST' :
		return JsonResponse({'message':  "Invalid request"}, status=405)
	if not request.user.is_authenticated:
		return JsonResponse({'message': "Client is not logged"}, status=401)

	try:
		data = json.loads(request.body)

		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)

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

		if user.username in NOT_USER:
			return JsonResponse({'message': "User not found"}, status=404)
		response = get_user_json(request.user, user, startDate, endDate)

		return JsonResponse(response, status=200)
	except json.JSONDecodeError:
		return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
	except (KeyError, ValueError):
		return JsonResponse({'message':  "Missing Data: " + str(request.body)}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'message': "User not found"}, status=404)
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
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
		name = data['name']

		if not name or not isinstance(name, str):
			return JsonResponse({'message': 'Invalid name'}, status=400)

		query_users = User.objects.filter(username__icontains=name)
		if not query_users:
			return JsonResponse({}, status=200)

		for user in query_users:
			if user.profile.blocked_users.filter(pk=request.user.pk).exists() or \
				user.username == request.user.username or user.username in NOT_USER:
				continue

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
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
		username = data["username"]

		if not username or not isinstance(username, str):
			return JsonResponse({'message': 'Invalid username'}, status=400)

		user = User.objects.get(username=username)

		if (user.profile.blocked_users.filter(pk=request.user.pk)).exists():
			return JsonResponse({'message': 'User blocked you', 'blocked': True}, status=200)

		if user.username in NOT_USER:
			return JsonResponse({'message': 'User not found'}, status=404)

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
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
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
				match.player_one = User.objects.get(username="blocked")
			p1_name = match.player_one.username
			p1_pfp = match.player_one.profile.profile_picture
			p1_display_name = match.player_one.profile.display_name

			if (match.player_two.profile.blocked_users.filter(pk=request.user.pk)).exists():
				match.player_two = User.objects.get(username="blocked")
			p2_name = match.player_two.username
			p2_pfp = match.player_two.profile.profile_picture
			p2_display_name = match.player_two.profile.display_name

			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["username"] = p1_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["display_name"] = p1_display_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["profile_picture"] = p1_pfp
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["winner"] = "left" if match.winnerSide == "left" else None
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerLeft"]["score"] = match.player_one_pts

			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["username"] = p2_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["display_name"] = p2_display_name
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["profile_picture"] = p2_pfp
			tournamentJson["round_{0}".format(match.round)]["match_{0}".format(match.match)]["playerRight"]["winner"] = "right" if match.winnerSide == "right" else None
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
		if not isinstance(data, dict):
			return JsonResponse({'message':  "Invalid JSON: " + str(request.body)}, status=400)
		id = data["id"]

		if not id or not isinstance(id, int):
			return JsonResponse({'message': 'Invalid id'}, status=400)

		match = gameModels.Match.objects.get(pk=id)

		if (match.player_one.profile.blocked_users.filter(pk=request.user.pk)).exists():
			match.player_one = User.objects.get(username="blocked")
		p1_name = match.player_one.username
		p1_pfp = match.player_one.profile.profile_picture
		p1_display_name = match.player_one.profile.display_name

		if (match.player_two.profile.blocked_users.filter(pk=request.user.pk)).exists():
			match.player_two = User.objects.get(username="blocked")
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

def socket_end(user):
	channel_layer = get_channel_layer()
	async_to_sync(channel_layer.group_send)(
		f"user_{user.id}",
		{
			"type": "socket_end",
			"message": "end",
		}
	)
