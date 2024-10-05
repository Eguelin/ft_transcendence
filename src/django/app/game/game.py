import json
from channels.generic.websocket import AsyncWebsocketConsumer
import time
import asyncio
import random
import math

class Matchmaking():
	waiting_players = []

	def __init__(self):
		pass

	def add_player(self, player):
		self.waiting_players.append(player)

	def remove_player(self, player):
		if player in self.waiting_players:
			self.waiting_players.remove(player)

	def match_players(self):
		if len(self.waiting_players) >= 2:
			socket1 = self.waiting_players.pop(0)
			socket2 = self.waiting_players.pop(0)
			return socket1, socket2
		return None, None

	async def run(self):
		socket1, socket2 = self.match_players()
		if socket1 and socket2:
			game = Game(socket1, socket2)
			socket1.player = game.playerLeft
			socket2.player = game.playerRight
			game.initialize()
			await game.initGame()

class Game():
	width = 800
	height = 600

	class Paddle():
		width = 8
		height = 120
		speed = 8
		margin = 4

		def getSize():
			return {
				'width': Game.Paddle.width,
				'height': Game.Paddle.height
			}

	class Ball():
		size = 10

		def __init__(self):
			self.x = 0
			self.y = 0
			self.dx = 0
			self.dy = 0
			self.speed = 0
			self.angle = 0

		def initPosition(self):
			self.x = (Game.width - Game.Ball.size) / 2
			self.y = (Game.height - Game.Ball.size) / 2
			self.speed = 3

			self.angle = math.pi + random.uniform(-1, 1) * math.pi / 3
			# self.angle = 0
			self.dx = math.cos(self.angle) * self.speed
			self.dy = math.sin(self.angle) * self.speed

		def move(self):
			self.x += self.dx
			self.y += self.dy

		def paddleCollision(self, pad):
			if self.speed < 10:
				self.speed += 0.5

			demiePaddle = (Game.Paddle.height + Game.Ball.size) / 2
			middlePad = pad.y + demiePaddle
			ballImpact = self.y + Game.Ball.size - middlePad

			self.angle = (ballImpact / demiePaddle) * (math.pi / 2.5)
			# self.angle = 0

			if self.dx > 0:
				self.dx = math.cos(self.angle) * self.speed * -1
			else:
				self.dx = math.cos(self.angle) * self.speed
			self.dy = math.sin(self.angle) * self.speed


		def getBall(self):
			return {
				'size': Game.Ball.size,
				'x': self.x,
				'y': self.y
			}

	def __init__(self, socket1, socket2):
		self.playerLeft = Player(socket1, 'left')
		self.playerRight = Player(socket2, 'right')
		self.ball = Game.Ball()

	def initialize(self):
		self.playerLeft.initPosition()
		self.playerRight.initPosition()
		self.ball.initPosition()

	async def initGame(self):
		await self.playerLeft.send('game_init', self.getInitGame())
		await self.playerRight.send('game_init', self.getInitGame())
		asyncio.create_task(self.updateGame())

	async def updateGame(self):

		while True:
			self.ball.move()
			self.checkCollision()
			await self.playerLeft.send('game_update', self.getGame())
			await self.playerRight.send('game_update', self.getGame())
			await asyncio.sleep(0.016)

	def checkCollision(self):
		if self.ball.y <= 0 or self.ball.y >= Game.height - Game.Ball.size:
			self.ball.dy = -self.ball.dy

		if self.ball.x <= 0:
			self.playerRight.score += 1
			self.ball.initPosition()

		elif self.ball.x + Game.Ball.size >= Game.width:
			self.playerLeft.score += 1
			self.ball.initPosition()
			self.ball.dx = -self.ball.dx

		elif self.ball.x <= self.playerLeft.x + Game.Paddle.width and self.ball.y >= self.playerLeft.y and self.ball.y <= self.playerLeft.y + Game.Paddle.height:
			self.ball.paddleCollision(self.playerLeft)
			self.ball.x = self.playerLeft.x + Game.Paddle.width

		elif self.ball.x + Game.Ball.size >= self.playerRight.x and self.ball.y >= self.playerRight.y and self.ball.y <= self.playerRight.y + Game.Paddle.height:
			self.ball.paddleCollision(self.playerRight)
			self.ball.x = self.playerRight.x - Game.Ball.size

	def getSize():
		return {
			'width': Game.width,
			'height': Game.height
		}

	def getGame(self):
		return {
			'player1': self.playerLeft.getPos(),
			'player2': self.playerRight.getPos(),
			'ball': self.ball.getBall()
		}

	def getInitGame(self):
		return {
			'canvas': Game.getSize(),
			'paddle': Game.Paddle.getSize(),
			'player1': self.playerLeft.getPos(),
			'player2': self.playerRight.getPos(),
			'ball': self.ball.getBall()
		}

class Player():
	def __init__(self, socket, side):
		self.socket = socket
		self.x = 0
		self.y = 0
		self.score = 0
		self.side = side

	def initPosition(self):
		if self.side == 'left':
			self.x = Game.Paddle.margin
			self.y = (Game.height - Game.Paddle.height) / 2
		elif self.side == 'right':
			self.x = Game.width - Game.Paddle.width - Game.Paddle.margin
			self.y = (Game.height - Game.Paddle.height) / 2

	async def send(self, type, message):
		await self.socket.send(type, message)

	def getPos(self):
		return {
			'x': self.x,
			'y': self.y
		}

	async def move(self, input):
		if (input.get('ArrowUp') or input.get('KeyW')) and self.y > 0:
			self.y -= Game.Paddle.speed
		elif (input.get('ArrowDown') or input.get('KeyS')) and self.y < Game.height - Game.Paddle.height:
			self.y += Game.Paddle.speed

class Consumer(AsyncWebsocketConsumer):
	matchmaking = Matchmaking()

	async def connect(self):
		self.player = None
		self.lastRequest = time.time()
		await self.accept()
		self.matchmaking.add_player(self)
		await self.matchmaking.run()

	async def disconnect(self, close_code):
		self.matchmaking.remove_player(self)

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data['type'] == 'game_keydown' and time.time() - self.lastRequest >= 0.016:
			self.lastRequest = time.time()
			if self.player:
				await self.player.move(data['message'])


	async def send(self, type, message):
		await super().send(text_data=json.dumps({
			'type': type,
			'message': message
		}))
