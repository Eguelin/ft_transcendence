from django.contrib.auth import login, authenticate, logout
from django.db import DatabaseError
from django.contrib.auth.models import User
from django.http import JsonResponse
import json, os, requests, base64, random, string, subprocess, datetime
import login.models as customModels
from django.core.validators import RegexValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
import json, os, requests, base64, random, zxcvbn, re

def generate_unique_username(base_username):
	username = base_username
	counter = 1
	while User.objects.filter(username=username).exists():
		username = f"{base_username}{counter}"
		counter += 1
	return username

def fortytwo(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=405)

	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

	code = data.get('code')
	if not code:
		return JsonResponse({'message': 'Invalid request Code'}, status=400)
	client_id = os.getenv('PUBLIC')
	client_secret = os.getenv('SECRET')
	redirect_uri = os.getenv('REDIRECT_URI')
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
	user_login = username[:15]

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
		user, user_existence = User.objects.get_or_create(username=user_login)
		if user_existence is False:
			user_login = generate_unique_username(user_login)
		user_login

		user.set_password(str(id42))
		user.save()
		user.profile.profile_picture = pfp_url
		user.profile.id42 = id42

		# CREATE RANDOM FIRST MATCH
		for i in range(0, 5):
			match = customModels.Match.objects.createWithRandomOpps(user)
			user.profile.matches.add(match)

		user.profile.save()
		user = authenticate(request, username=user.username, password=str(id42))
		if user is not None:
			login(request, user)
			return JsonResponse({'message': 'User created and logged in', 'content': pfp_url})
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=401)

def create_user(request):
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
	result = zxcvbn.zxcvbn(password)
	if result['score'] < 4 and os.getenv('DEBUG') == 'False':
		return JsonResponse({'message': 'Password too weak'}, status=400)

	if User.objects.filter(username=username).exists():
		return JsonResponse({'message': 'User with same username already exist'}, status=400)
	try:
		user = User.objects.create_user(username=username, password=password)
		user.profile.profile_picture = "profilePictures/defaults/default{0}.jpg".format(random.randint(0, 2))
		user.id42 = 0
		user.profile.is_active = True

		if 'lang' in data:
			user.profile.language_pack = data['lang']

		# CREATE RANDOM FIRST MATCH
		for i in range(0, 1000):
			match = customModels.Match.objects.createWithRandomOpps(user)
			user.profile.matches.add(match)
		user = authenticate(request, username=username, password=password)
		return JsonResponse({'message': 'User created'}, status=201)
	except DatabaseError:
		return JsonResponse({'message': 'Database error'}, status=500)
	except Exception as e:
		return JsonResponse({'message': str(e)}, status=500)

def user_login(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request', 'logged' : 0}, status=405)
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON', 'logged' : 0}, status=400)

	try :
		username = data.get('username')
		password = data.get('password')
	except Exception as e:
		return JsonResponse({'message': str(e)}, status=500)

	if not username or not password:
		return JsonResponse({'message': 'Username and password are required', 'logged' : 0}, status=400)
	try:
		user = User.objects.get(username=username)

		if user.profile.id42 != 0:
			return JsonResponse({'message': 'Forbidden', 'logged' : 0}, status=403)

		user = authenticate(request, username=username, password=password)
		if user is not None:
			user.profile.is_active = True
			user.save()
			login(request, user)
			return JsonResponse({'message': 'User logged in', 'logged' : 1}, status=200)
		else:
			return JsonResponse({'message': 'Invalid credentials', 'logged' : 0}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'message': 'Invalid credentials', 'logged' : 0}, status=400)
	except Exception as e:
		return JsonResponse({'message': str(e), 'logged' : 0}, status=500)

def user_logout(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if (request.user.is_authenticated):
		request.user.profile.is_active = False
		request.user.save()
		logout(request)
	return JsonResponse({'message': 'User logged out'}, status=200)

def delete_user(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if (request.user.is_authenticated):
		try:
			request.user.delete()
			return JsonResponse({'message': 'User deleted'}, status=200)
		except Exception as e:
			return JsonResponse({'message': e}, status=500)
	return JsonResponse({'message': 'can\'t delete user'}, status=200)

def file_opener(path, flags):
	return os.open(path, flags, 0o777)

def profile_update(request):
	if (request.user.is_authenticated):
		if (request.method == 'POST'):
			try:
				data = json.loads(request.body)
				user = request.user
				if "is_dark_theme" in data:
					user.profile.dark_theme = data['is_dark_theme']
				if "username" in data:
					user.username = data['username']
				username_validator = RegexValidator(regex=r'^[\w-]+$', message='Username must be alphanumeric')
				max_length_validator = MaxLengthValidator(15, message='Username must be 15 characters or fewer')
				try:
					username_validator(user.username)
					max_length_validator(user.username)
				except ValidationError as e:
					return JsonResponse({'message': e.message}, status=400)
				if "pfp" in data:
					if user.profile.profile_picture and os.path.exists(user.profile.profile_picture):
						os.remove(user.profile.profile_picture)
					raw = data['pfp']
					pfpName = "profilePictures/{0}.jpg".format(user.username)
					with open(pfpName, "wb", opener=file_opener) as f:
						f.write(base64.b64decode(raw))
					user.profile.profile_picture = pfpName
				if ("language_pack" in data):
					user.profile.language_pack = data['language_pack']
				if ("is_active" in data):
					user.profile.is_active = data['is_active']
				user.save()
				return JsonResponse({'message': 'User profile updated'}, status=200)
			except json.JSONDecodeError:
				return JsonResponse({'message': 'Invalid JSON'}, status=400)
	return JsonResponse({'message': 'Can\'t update user profile'}, status=400)

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

		matches = get_user_match(request.user.profile.matches.filter(date=datetime.date.today()))
		return JsonResponse({'username': request.user.username,
			'is_dark_theme': request.user.profile.dark_theme,
			'pfp': request.user.profile.profile_picture,
			'lang': request.user.profile.language_pack,
			'friends': friend_json,
			'friend_request': friend_request_json,
			'blocked_users': blocked_json,
			'is_active': request.user.profile.is_active,
			'matches' : matches
			})
	else:
		return JsonResponse({'username': None}, status=404)

def get(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		try:
			return JsonResponse(get_user_json(User.objects.get(username=data['name']), data['startDate'], data['endDate']), status=200)
		except Exception as error:
			return JsonResponse({'message': "can't find user"}, status=400)

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
			return JsonResponse(users_json, status=400)
		except Exception as error:
			return JsonResponse({'message': error}, status=500)
