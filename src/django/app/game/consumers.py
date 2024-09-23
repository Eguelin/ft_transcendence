import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = await self.get_user()
        if self.user.is_authenticated:
            await self.accept()
            await self.channel_layer.group_add("waiting_room", self.channel_name)
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard("waiting_room", self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

    async def send_message(self, message):
        await self.send(text_data=json.dumps(
            {
                "message": message,
            }
        ))

    async def send_message_to_group(self, message, group):
        await self.channel_layer.group_send(
            group,
            {
                "message": message
            },
        )


    @database_sync_to_async
    def get_user(self):
        return self.scope["user"]


    async def get_number_of_users_in_group(self, group_name):
        group_channels = await self.channel_layer.group_channels(group_name)
        return len(group_channels)
