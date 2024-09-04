from django.contrib.auth import login, authenticate, logout
from django.db import DatabaseError, IntegrityError
from django.contrib.auth.models import User
from django.http import JsonResponse
import json, os, requests, base64, random, string
import login.models as customModels

import subprocess

def generate_unique_username(base_username):
	username = base_username
	counter = 1
	while User.objects.filter(username=username).exists():
		username = f"{base_username}{counter}"
		counter += 1
	return username

def fortytwo(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)

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
		return JsonResponse({'message': 'Failed to retrieve access token'}, status=400)
	url = 'https://api.intra.42.fr/v2/me'
	headers = {
		'Authorization': f'Bearer {access_token}'
	}
	response = requests.get(url, headers=headers)
	if response.status_code != 200:
		return JsonResponse(response.json(), status=response.status_code)
	user_json = response.json()
	user_login = user_json.get('login')
	pfp_url = user_json.get('image', {}).get('versions', {}).get('small', '')
	display = user_login
	id42 = user_json.get('id')
	if not user_login or id42 is None:
		return JsonResponse({'message': 'Failed to retrieve user data'}, status=400)
	try:
		user = User.objects.get(profile__id42=id42)
		user = authenticate(request, username=user.username, password=user.username)
		if user is not None:
			user.profile.is_active = True
			user.save()
			login(request, user)
			return JsonResponse({'message': 'User logged in', 'content': pfp_url})
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=400)
	except User.DoesNotExist:
		user, created = User.objects.get_or_create(username=user_login)
		if created:
			user.set_password(user.username)
			user.save()
			user.profile.display_name = display
			user.profile.profile_picture = pfp_url
			user.profile.id42 = id42

			# CREATE RANDOM FIRST MATCH
			for i in range(0, 5):
				match = customModels.Match.objects.createWithRandomOpps(user)
				user.profile.matches.add(match)

			user.profile.save()
			user = authenticate(request, username=user.username, password=user.username)
			if user is not None:
				login(request, user)
				return JsonResponse({'message': 'User created and logged in', 'content': pfp_url})
			else:
				return JsonResponse({'message': 'Invalid credentials'}, status=400)
		else:
			username = generate_unique_username(user_login)
			user = User.objects.create_user(username=username, password=username)
			user.profile.display_name = display
			user.profile.profile_picture = pfp_url
			user.profile.id42 = id42

			# CREATE RANDOM FIRST MATCH
			for i in range(0, 5):
				match = customModels.Match.objects.createWithRandomOpps(user)
				user.profile.matches.add(match)

			user.save()
			user = authenticate(request, username=username, password=username)
			if user is not None:
				login(request, user)
				return JsonResponse({'message': 'User created and logged in', 'content': pfp_url})
			else:
				return JsonResponse({'message': 'Invalid credentials'}, status=400)

def create_user(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=400)
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)
	try:
		username = data['username']
		password = data['password']
		display = data['displayName']
	except Exception as e:
		return JsonResponse({'message': str(e)}, status=400)
	if username is None or password is None:
		return JsonResponse({'message': 'Invalid request'}, status=400)

	if User.objects.filter(username=username).exists():
		return JsonResponse({'message': 'User with same username already exist'}, status=400)
	try:
		user = User.objects.create_user(username=username, password=password)
		if (len(display) > 15):
			user.profile.display_name = display[:15]
		else:
			user.profile.display_name = display
		user.profile.profile_picture = "profilePictures/defaults/default{0}.jpg".format(random.randint(0, 2))
		user.id42 = 0
		user.profile.is_active = True

		if 'lang' in data:
			user.profile.language_pack = data['lang']

		# CREATE RANDOM FIRST MATCH
		for i in range(0, 5):
			match = customModels.Match.objects.createWithRandomOpps(user)
			user.profile.matches.add(match)

		for count in range (0, 0x7fffffff):
			friend_code = ''.join(random.choices(string.ascii_letters + string.digits, k=20))
			user.profile.friend_code = friend_code
			try:
				user.save()
				break
			except:
				continue
		user = authenticate(request, username=username, password=password)
		return JsonResponse({'message': 'User created'}, status=201)
	except DatabaseError:
		return JsonResponse({'message': 'Database error'}, status=500)

def user_login(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)
	username = data.get('username')
	password = data.get('password')
	if not username or not password:
		return JsonResponse({'message': 'Username and password are required'}, status=400)
	try:
		user = User.objects.get(username=username)

		if user.profile.id42 != 0:
			return JsonResponse({'message': 'User does not exist'}, status=404)

		user = authenticate(request, username=username, password=password)
		if user is not None:
			user.profile.is_active = True
			user.save()
			login(request, user)
			return JsonResponse({'message': 'User logged in'})
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'message': 'User does not exist'}, status=404)
	except Exception as e:
		return JsonResponse({'message': str(e)}, status=404)

def user_logout(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	request.user.profile.is_active = False
	request.user.save()
	logout(request)
	return JsonResponse({'message': 'User logged out'})

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
				if "display" in data:
					if (len(data['display']) > 15):
						user.profile.display_name = data['display'][:15]
					else:
						user.profile.display_name = data['display']
				if "pfp" in data:
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
				return JsonResponse({'message': 'User profile updated'})
			except json.JSONDecodeError:
				return JsonResponse({'message': 'Invalid JSON'}, status=400)
	return JsonResponse({'message': 'Can\'t update user profile'})


def get_user_match_json(matches):
	matches_json = {}
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

def get_user_json(user):
	try:
		if (user.profile.profile_picture.startswith("https://")):
			raw_img = user.profile.profile_picture
		else:
			f = open(user.profile.profile_picture, "rb")
			raw_img = (base64.b64encode(f.read())).decode('utf-8')
	except:
		raw_img = ""
	matches = get_user_match_json(user.profile.matches.all())
	return {'username' : user.username,
		'display' : user.profile.display_name,
		'friend_code' : user.profile.friend_code,
		'pfp' : raw_img,
		'is_active' : user.profile.is_active,
		'matches' : matches
	}

def get_user_preview_json(user):
	try:
		if (user.profile.profile_picture.startswith("https://")):
			raw_img = user.profile.profile_picture
		else:
			f = open(user.profile.profile_picture, "rb")
			raw_img = (base64.b64encode(f.read())).decode('utf-8')
	except:
		raw_img = ""
	return {'username' : user.username,
		'display' : user.profile.display_name,
		'pfp' : raw_img,
		'is_active' : user.profile.is_active,
	}

def current_user(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		try:
			if (request.user.profile.profile_picture.startswith("https://")):
				raw_img = request.user.profile.profile_picture
			else:
				f = open(request.user.profile.profile_picture, "rb")
				raw_img = (base64.b64encode(f.read())).decode('utf-8')
		except:
			raw_img = ""
		friends_list = request.user.profile.friends.all()
		friends_request_list = request.user.profile.friends_request.all()
		blocked_list = request.user.profile.blocked_users.all()
		friend_json = {}
		friend_request_json = {}
		blocked_json = {}
		i = 0
		for e in friends_list:
			friend_json[i] = get_user_json(e)
			i += 1
		i = 0
		for e in friends_request_list:
			friend_request_json[i] = get_user_json(e)
			i += 1

		i = 0
		for e in blocked_list:
			blocked_json[i] = get_user_json(e)
			i += 1
		matches = get_user_match_json(request.user.profile.matches.all())
		return JsonResponse({'username': request.user.username,
			'display': request.user.profile.display_name,
			'is_dark_theme': request.user.profile.dark_theme,
			'pfp': raw_img,
			'lang': request.user.profile.language_pack,
			'friend_code': request.user.profile.friend_code,
			'friends': friend_json,
			'friend_request': friend_request_json,
			'blocked_users': blocked_json,
			'is_active': request.user.profile.is_active,
			'matches' : matches
			})
	else:
		return JsonResponse({'username': None}, status=400)

def generate_unique_username(base_username):
	def random_suffix(length=5):
		letters_and_digits = string.ascii_letters + string.digits
		return ''.join(random.choice(letters_and_digits) for i in range(length))

	unique_username = base_username
	suffix_length = 5
	while User.objects.filter(username=unique_username).exists():
		unique_username = f"{base_username}_{random_suffix(suffix_length)}"
		suffix_length += 1

	return unique_username

def get(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		try:
			return JsonResponse(get_user_json(User.objects.get(username=data['name'])), status=200)
		except:
			return JsonResponse({'message': "can't find user"}, status=400)

def search_by_display(request):
	if (request.method != 'POST'):
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		users_json = {}
		try:
			query_users = customModels.Profile.objects.filter(display_name__icontains=data['name'])
			i = 0
			for user in query_users:
				users_json[i] = get_user_preview_json(user.user)
				i += 1
			if i == 0:
				return JsonResponse({}, status=200)
			return JsonResponse(users_json, status=200)
		except Exception as error:
			return JsonResponse({'message': error}, status=400)
