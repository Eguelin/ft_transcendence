from django.contrib.auth import login, authenticate, logout
from django.db import DatabaseError, IntegrityError
from django.contrib.auth.models import User
from django.http import JsonResponse
import json, os, requests, base64, random, string
import login.models as customModels

def send_friend_request(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		username = data['username']
		if (username == request.user.username):
			return JsonResponse({'message': 'Can\'t send friend request with yourself'})
		try:
			new_friend = User.objects.get(username=username)
			user = request.user
			if (new_friend.profile.blocked_users.filter(pk=user.pk)).exists():
				return JsonResponse({'message': 'User blocked you'})
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
				return JsonResponse({'message': 'Request succesfully sent'})
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
		username = data['username']
		try:
			new_friend = User.objects.get(username=username)
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
		username = data['username']
		try:
			new_friend = User.objects.get(username=username)
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
		username = data['username']
		try:
			friend = User.objects.get(username=username)
			user = request.user
			friend.profile.friends.remove(user)
			friend.save()
			user.profile.friends.remove(friend)
			user.save()
			return JsonResponse({'message': 'Succesfully added friend'})
		except:
			return JsonResponse({'message': 'Can\'t find user'}, status=400)
	else:
		return JsonResponse({'username': None}, status=400)

def block_friend(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		username = data['username']
		try:
			ennemy = User.objects.get(username=username)
			user = request.user
			ennemy.profile.friends.remove(user)
			ennemy.save()
			user.profile.friends.remove(ennemy)
			user.profile.blocked_users.add(ennemy)
			user.save()
			return JsonResponse({'message': 'Succesfully blocked user'})
		except:
			return JsonResponse({'message': 'Can\'t find user'}, status=400)
	else:
		return JsonResponse({'username': None}, status=400)

def unblock_user(request):
	if request.method != 'POST':
		return JsonResponse({'message': 'Invalid request'}, status=400)
	if request.user.is_authenticated:
		data = json.loads(request.body)
		username = data['username']
		try:
			request.user.profile.blocked_users.remove(User.objects.get(username=username))
			request.user.save()
			return JsonResponse({'message': 'Succesfully unblocked user'})
		except:
			return JsonResponse({'message': 'Can\'t find user'}, status=400)
	else:
		return JsonResponse({'username': None}, status=400)
