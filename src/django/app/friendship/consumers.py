import json
from channels.generic.websocket import AsyncWebsocketConsumer

class FriendConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		await self.join_group('friends')
		username = self.scope['user'].username
		await self.send_message("Connected to the server!")
		await self.send_message_to_group(username, 'friends')

	async def disconnect(self, close_code):
		pass

	async def join_group(self, group):
		await self.channel_layer.group_add(
			group,
			self.channel_name
		)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message = text_data_json['message']

		self.send(text_data=json.dumps({
			'message': message
		}))

	async def send_message(self, message):
		await self.send(text_data=json.dumps({
			'message': message
		}))

	async def private_message(self, event):
		await self.send(text_data=json.dumps({
			'message': event['message']
		}))

	async def send_message_to_group(self, message, group):
		await self.channel_layer.group_send(
			group,
			{
				'type': 'test',
				'message': message
			},
		)

	async def test(self, event):
		await self.send(text_data=json.dumps({
			'message': event['message']
		}))
