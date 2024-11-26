import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from login.models import Profile

class friend(AsyncWebsocketConsumer):
	async def connect(self):
		self.user = self.scope['user']

		if self.user.is_authenticated:
			self.group_name = f"user_{self.user.id}"
			await self.channel_layer.group_add(
				self.group_name,
				self.channel_name
			)
			await self.accept()
		else:
			await self.close()

	async def disconnect(self, close_code):

		if self.user.is_authenticated:
			await self.channel_layer.group_discard(
				self.group_name,
				self.channel_name
			)

	async def receive(self, text_data):
		data = json.loads(text_data)
		type = data.get('type')

		if type == 'send_friend_request':
			await self.send_friend_request_notif(data.get('target_user_id'), data.get('sender_username'))

	async def send_friend_request_notif(self, user_id, sender_name):
		try:
				if not isinstance(user_id, int) or user_id <= 0:
						raise ValueError("user id is invalid")

				if not sender_name or not isinstance(sender_name, str):
						raise ValueError("username is invalid")

				channel_layer = get_channel_layer()

				await channel_layer.group_send(
						f"user_{user_id}",
						{
								'type': 'send_friend_request',
								'new_request': True,
								'sender_name': sender_name
						}
				)
		except ValueError as e:
			await self.send(text_data=json.dumps({
			'type': 'error',
			'message': str(e)
		}))


	async def send_friend_request(self, event):
		await self.send(text_data=json.dumps({
			'new_request': event['new_request'],
			'sender_name' : event['sender_name']

		}))

	async def friend_status_update(self, event):
		await self.send(text_data=json.dumps({
			'username': event['message']['username'],
			'status': event['message']['status']
		}))

	async def friend_removed(self, event):
		await self.send(text_data=json.dumps({
		'type': 'friend_removed',
		'username': event['message']['username'],
	}))


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
					},
				}
			)

@receiver(post_save, sender=Profile)
def notify_friend_status(sender, instance, **kwargs):
	channel_layer = get_channel_layer()
	user = instance.user
	status = "online" if instance.is_active else "offline"

	friends = instance.friends.all()

	for friend in friends:
		async_to_sync(channel_layer.group_send)(
			f"user_{friend.id}",
			{
				"type": "friend_status_update",
				"message": {
					"username": user.username,
					"status": status,
				},
			}
		)
