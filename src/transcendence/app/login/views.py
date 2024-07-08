from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
import json

def create_user(request):
	if request.method != 'POST' :
		return JsonResponse({'message': 'Invalid request'}, status=400)
	data = json.loads(request.body)
	username = data['username']
	password = data['password']
	if username is None or password is None:
		return JsonResponse({'message': 'Invalid request'}, status=400)
	user = User.objects.create_user(username=username, password=password)
	user.save()
	return JsonResponse({'message': 'User created'})
	
def user_login(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)

	data = json.loads(request.body)
	username = data['username']
	password = data['password']
	if username is None or password is None:
		return JsonResponse({'message': 'Invalid request'}, status=400)

	user = authenticate(request, username=username, password=password)
	if user is not None:
		login(request, user)
		return JsonResponse({'message': 'User logged in'})
	else:
		return JsonResponse({'message': 'Invalid credentials'}, status=400)

def user_logout(request):
	logout(request)
	return JsonResponse({'message': 'User logged out'})

def current_user(request):
	if request.user.is_authenticated:
		return JsonResponse({
			'username': request.user.username
			})
	else:
		return JsonResponse({'username': None})