import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from login.models import Profile
from django.contrib.auth.models import User

class friend(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope['user']

		if await self.userIsAuthenticated():
			self.group_name = f"user_{self.user.id}"
			await self.channel_layer.group_add(
				self.group_name,
				self.channel_name
			)
			await self.accept()
			await self.update_activity(True)
		else:
			await self.close()

	async def disconnect(self, close_code):
		if await self.userIsAuthenticated():
			await self.channel_layer.group_discard(
				self.group_name,
				self.channel_name
			)
			await self.update_activity(False)

	async def socket_end(self, event):
		await self.close()

	async def send_friend_request(self, event):
		await self.send(text_data=json.dumps({
			'type': "friend_request",
			'username' : event['username'],
			'id' : event['id'],
			'pfp' : event['pfp']
		}))

	async def friend_status_update(self, event):
		await self.send(text_data=json.dumps({
			'type': 'friend_status_update',
			'username': event['message']['username'],
			'id': event['message']['id'],
			'pfp': event['message']['pfp'],
			'is_active': event['message']['is_active']
		}))

	async def friend_removed(self, event):
		await self.send(text_data=json.dumps({
		'type': 'friend_removed',
		'username': event['message']['username'],
		'id': event['message']['id']
	}))

	@sync_to_async
	def update_activity(self, bool):
		try:
			self.user = User.objects.get(id=self.user.id)
			self.user.profile.is_active = bool
			self.user.profile.save()
		except User.DoesNotExist:
			pass

	@sync_to_async
	def userIsAuthenticated(self):
		try:
			self.user = User.objects.get(id=self.user.id)
		except User.DoesNotExist:
			return False
		return self.user.is_authenticated

@receiver(m2m_changed, sender=Profile.friends_request.through)
def notify_friend_request_changed(sender, instance, action, pk_set, **kwargs):
	channel_layer = get_channel_layer()
	user = instance.user

	if action == "post_add":
		new_requests = Profile.objects.filter(user__id__in=pk_set)
		for new_request in new_requests:
			async_to_sync(channel_layer.group_send)(
				f"user_{user.id}",
				{
					"type": "send_friend_request",
					"username": new_request.user.username,
					"id" : new_request.user.id,
					"pfp" : new_request.profile_picture
				}
			)

@receiver(m2m_changed, sender=Profile.friends.through)
def notify_friend_removed(sender, instance, action, pk_set, **kwargs):
	if action == "post_remove":
		channel_layer = get_channel_layer()
		user = instance.user
		removed_friends = Profile.objects.filter(user__id__in=pk_set)

		for removed_friend in removed_friends:
			async_to_sync(channel_layer.group_send)(
				f"user_{removed_friend.user.id}",
				{
					"type": "friend_removed",
					"message": {
						"username": user.username,
						"id": user.id,
					},
				}
			)

@receiver(post_save, sender=Profile)
def notify_friend_status(sender, instance, **kwargs):
	channel_layer = get_channel_layer()
	user = instance.user
	status = "online" if instance.is_active else "offline"

	friends = instance.friends.all()

	info = {
		"username": user.username,
		"id" : user.id,
		"pfp" : user.profile.profile_picture,
		"is_active": instance.is_active,
	}

	for friend in friends:
		async_to_sync(channel_layer.group_send)(
			f"user_{friend.id}",
			{
				"type": "friend_status_update",
				"message": info
			}
		)
