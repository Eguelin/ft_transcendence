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

def create_user(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if request.user.is_authenticated:
		if not request.user.is_staff:
			return JsonResponse({'message': 'user is not admin'}, status=400)
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
			user.profile.profile_picture = "/images/defaults/default{0}.jpg".format(random.randint(0, 2))
			user.id42 = 0

			# CREATE RANDOM FIRST MATCH
			return JsonResponse({'message': 'User created'}, status=201)
		except DatabaseError:
			return JsonResponse({'message': 'Database error'}, status=500)
		except Exception as e:
			return JsonResponse({'message': str(e)}, status=500)
	else:
		return JsonResponse({'message': 'User is not authenticated'}, status=400)


def create_match(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=405)
	if request.user.is_authenticated:
		if not request.user.is_staff:
			return JsonResponse({'message': 'user is not admin'}, status=400)
		try:
			data = json.loads(request.body)
		except json.JSONDecodeError:
			return JsonResponse({'message': 'Invalid JSON'}, status=400)
		matches = {}
		for i in range(0, data['range']):
			match = customModels.Match.objects.createWithTwoOpps(data['userOne'], data['userTwo'])
			matches[i] = {'playerOne': match.player_one.username,
				 'playerTwo': match.player_two.username,
				 'playerOnePts': match.player_one_pts,
				 'playerTwoPts': match.player_two_pts,
				 'date': match.date,}
		return JsonResponse({'message': 'Matches created', 'matches' : matches}, status=201)


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
					raw = data['pfp']
					pfpName = "/images/{0}.jpg".format(user.username)
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
			return JsonResponse(users_json, status=200)
		except Exception as error:
			return JsonResponse({'message': error}, status=500)
