from django.contrib.auth import login, authenticate, logout
from django.db import DatabaseError, IntegrityError
from django.contrib.auth.models import User
from django.http import JsonResponse
import json

def create_user(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=400)
	try:
		data = json.loads(request.body)
	except json.JSONDecodeError:
		return JsonResponse({'message': 'Invalid JSON'}, status=400)
	username = data['username']
	password = data['password']
	if username is None or password is None:
		return JsonResponse({'message': 'Invalid request'}, status=400)
	try:
		user = User.objects.create_user(username=username, password=password)
		user.save()
		return JsonResponse({'message': 'User created'}, status=201)
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
		username = data('username')
		password = data('password')
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

def current_user(request):
	if request.method != 'GET':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		return JsonResponse({'username': request.user.username})
	else:
		return JsonResponse({'username': None})
