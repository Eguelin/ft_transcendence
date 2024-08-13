from django.contrib.auth import login, authenticate, logout
from django.db import DatabaseError, IntegrityError
from django.contrib.auth.models import User
from django.http import JsonResponse
import json, os, requests, base64, random, string
import login.models as customModels

# Create your views here.

def send_friend_request(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		code = data['code']
		if (code == request.user.profile.friend_code):
			return JsonResponse({'message': 'Can\'t send friend request with yourself'})
		try:
			new_friend = customModels.Profile.objects.get(friend_code=code).user
			user = request.user
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
				return JsonResponse({'message': 'Reqyest succesfully sent'})
			else :
				return JsonResponse({'message': 'Request already sent'})
		except:
			return JsonResponse({'message': 'Can\'t find user'}, status=400)
	else:
		return JsonResponse({'username': None}, status=400)
		
def accept_friend_request(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		code = data['code']
		try:
			new_friend = customModels.Profile.objects.get(friend_code=code).user
			user = request.user
			new_friend.profile.friends.add(user)
			new_friend.save()
			user.profile.friends_request.remove(new_friend)
			user.profile.friends.add(new_friend)
			user.save()
			return JsonResponse({'message': 'Succesfully added friend'})
		except:
			return JsonResponse({'message': 'Can\'t find user'}, status=400)
	else:
		return JsonResponse({'username': None}, status=400)
		
def reject_friend_request(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		code = data['code']
		try:
			new_friend = customModels.Profile.objects.get(friend_code=code).user
			user = request.user
			user.profile.friends_request.remove(new_friend)
			user.save()
			return JsonResponse({'message': 'Succesfully added friend'})
		except:
			return JsonResponse({'message': 'Can\'t find user'}, status=400)
	else:
		return JsonResponse({'username': None}, status=400)

def remove_friend(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		code = data['code']
		try:
			friend = customModels.Profile.objects.get(friend_code=code).user
			user = request.user
			user.profile.friends.remove(friend)
			user.save()
			return JsonResponse({'message': 'Succesfully added friend'})
		except:
			return JsonResponse({'message': 'Can\'t find user'}, status=400)
	else:
		return JsonResponse({'username': None}, status=400)
