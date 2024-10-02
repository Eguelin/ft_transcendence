import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import asyncio
import time

class Matchmaking():
	waiting_players = []

	def __init__(self):
		pass

	async def add_player(self, player):
		self.waiting_players.append(player)

	async def remove_player(self, player):
		if player in self.waiting_players:
			self.waiting_players.remove(player)

	async def match_players(self):
		if len(self.waiting_players) >= 2:
			player1 = self.waiting_players.pop(0)
			player2 = self.waiting_players.pop(0)
			return player1, player2
		return None, None

	async def run(self):
		player1, player2 = await self.match_players()
		if player1 and player2:
			game = Game(player1, player2)
			await game.run()

class Game():
	canvas = {
		'width': 4000,
		'height': 3000
	}

	paddle = {
		'height': 500,
		'width': 40,
	}

	player1 = {
		'x': 20,
		'y':  (canvas['height'] - paddle['height']) / 2,
	}

	player2 = {
		'x': canvas['width'] - paddle['width'] - 20,
		'y': (canvas['height'] - paddle['height']) / 2,
	}

	ball = {
		'size': 50,
		'x': (canvas['width'] - 50) / 2,
		'y': (canvas['height'] - 50) / 2,
	}

	def __init__(self, player1, player2):
		self.player1 = player1
		self.player2 = player2

	async def run(self):
		game_id = "new_game_id"
		await self.player1.send({
			'type': 'redirect',
			'game_id': game_id
		})
		await self.player2.send({
			'type': 'redirect',
			'game_id': game_id
		})

	async def initGame(player):
		await player.send('game_init',
			{
				'canvas': Game.canvas,
				'paddle': Game.paddle,
				'player1': Game.player1,
				'player2': Game.player2,
				'ball': Game.ball
			}
		)


class Player(AsyncWebsocketConsumer):
	# matchmaking = Matchmaking()

	async def connect(self):
		await self.accept()
		# await self.matchmaking.add_player(self)
		# await self.matchmaking.run()
		self.last_game_request = time.time()

	async def disconnect(self, close_code):
		# await self.matchmaking.remove_player(self)
		pass

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data['type'] == 'game_keydown' and time.time() - self.last_game_request >= 0.02:
			self.last_game_request = time.time()
			await self.send('game_keydown', data['message'])
		elif data['type'] == 'game_init':
			await Game.initGame(self)

	async def send(self, type, message):
		await super().send(text_data=json.dumps({
			'type': type,
			'message': message
		}))
