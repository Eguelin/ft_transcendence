from django.contrib.auth import login, authenticate, logout
from django.db import DatabaseError, IntegrityError
from django.contrib.auth.models import User
from django.http import JsonResponse
import json

import subprocess
import base64

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
	try:
		user = User.objects.create_user(username=username, password=password)
		if (len(display) > 15):
			 user.profile.display_name = display[:15];
		else:
			user.profile.display_name = display;
		user.save()
		user = authenticate(request, username=username, password=password)
		return JsonResponse({'message': 'User created but not logged in'}, status=201)
	except IntegrityError:
		return JsonResponse({'message': 'Username already exists'}, status=409)
	except DatabaseError:
		return JsonResponse({'message': 'Database error'}, status=500)
	except Exception as e:
		return JsonResponse({'message': str(e)}, status=500)

def user_login(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)

	try:
		data = json.loads(request.body)
		username = data['username']
		password = data['password']
		if not username or not password:
			return JsonResponse({'message': 'Username and password are required'}, status=400)
		user = authenticate(request, username=username, password=password)
		if user is not None:
			login(request, user)
			return JsonResponse({'message': 'User logged in'})
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=400)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)

def user_logout(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	logout(request)
	return JsonResponse({'message': 'User logged out'})

def profile_update(request):
	if (request.method == 'POST'):
		try:
			data = json.loads(request.body)
			user = request.user
			if "dark_theme" in data:
				user.profile.dark_theme = data['dark_theme']
			if "username" in data:
				user.username = data['username']
			if "display" in data:
				if (len(data['display']) > 15):
					 user.profile.display_name = data['display'][:15];
				else:
					user.profile.display_name = data['display']
			if "pfp" in data:
				raw = data['pfp']
				pfpName = "profilePictures/{0}.jpg".format(user.username)
				f = open(pfpName, "wb")
				f.write(base64.b64decode(raw))
				f.close()
				user.profile.profile_picture = pfpName								
			if ("language_pack" in data):
				user.profile.language_pack = data['language_pack']
			user.save()
			return JsonResponse({'message': 'User profile updated'})
		except json.JSONDecodeError:
			return JsonResponse({'message': 'Invalid JSON'}, status=400)

def current_user(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		f = open(request.user.profile.profile_picture, "rb")
		raw_img = (base64.b64encode(f.read())).decode('utf-8')
		
		return JsonResponse({'username': request.user.username,
            'display': request.user.profile.display_name,
			'theme': request.user.profile.dark_theme,
			'pfp': raw_img,
			'lang': request.user.profile.language_pack})
	else:
		return JsonResponse({'username': None}, status=400)
