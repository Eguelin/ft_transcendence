import json
from channels.generic.websocket import AsyncWebsocketConsumer

class friend(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		await self.send_message("Connected to the server!")

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
		type = text_data_json['type']

		if type == 'friend_update':
			await self.send_message('received' + message)


		self.send(text_data=json.dumps({
			'message': message
		}))

	async def send_message(self, message):
		await self.send(text_data=json.dumps({
			'message': message
		}))

