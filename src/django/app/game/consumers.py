import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            await self.accept()
            await self.channel_layer.group_add("waiting_room", self.channel_name)
            print(f"WebSocket opened by user: {self.user.username}")
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.channel_layer.group_discard("waiting_room", self.channel_name)
            print(f"WebSocket closed by user: {self.user.username}")

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        await self.channel_layer.group_send(
            "waiting_room",
            {
                "type": "game_message",
                "message": self.user.username + " : " + message
            },
        )

    async def game_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message,}))

    @database_sync_to_async
    def get_user(self):
        return self.scope["user"]









