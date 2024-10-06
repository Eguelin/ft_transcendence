import json
from channels.generic.websocket import AsyncWebsocketConsumer
import time
import asyncio
import random
import math

class Ball():
	size = 10
	demieSize = size / 2

	def __init__(self):
		self.x = 0
		self.y = 0
		self.dx = 0
		self.dy = 0
		self.speed = 0
		self.angle = 0

	def initPosition(self):
		self.x = Game.demieWidth
		self.y = Game.demieHeight
		self.speed = 3

		self.angle = math.pi + random.uniform(-1, 1) * math.pi / 3
		self.dx = math.cos(self.angle) * self.speed
		self.dy = math.sin(self.angle) * self.speed

	def move(self):
		self.x += self.dx
		self.y += self.dy

	def paddleCollision(self, pad):
		if self.y < pad.y - Paddle.demieHeight or self.y > pad.y + Paddle.demieHeight:
			return

		if self.speed < 10:
			self.speed += 0.5

		ballImpact = self.y - pad.y

		self.angle = (ballImpact / Paddle.demieHeight) * (math.pi / 3)

		if self.dx > 0:
			self.x = pad.x - Ball.demieSize
			self.dx = math.cos(self.angle) * self.speed * -1
		else:
			self.x = pad.x + Ball.demieSize
			self.dx = math.cos(self.angle) * self.speed
		self.dy = math.sin(self.angle) * self.speed


	def getBall(self):
		return {
			'size': Ball.size,
			'x': self.x - Ball.demieSize,
			'y': self.y - Ball.demieSize
		}

class Paddle():
	width = 8
	height = 120
	demieWidth = width / 2
	demieHeight = height / 2
	speed = 8
	margin = 4

	def getSize():
		return {
			'width': Paddle.width,
			'height': Paddle.height
		}

class Game():
	width = 800
	height = 600
	demieWidth = width / 2
	demieHeight = height / 2

	def __init__(self, socket1, socket2):
		self.playerLeft = Player(socket1, 'left')
		self.playerRight = Player(socket2, 'right')
		self.ball = Ball()

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
		if self.ball.x <= 0:
			self.playerRight.score += 1
			self.ball.initPosition()

		elif self.ball.x >= Game.width:
			self.playerLeft.score += 1
			self.ball.initPosition()
			self.ball.dx = -self.ball.dx

		elif self.ball.x <= self.playerLeft.x:
			self.ball.paddleCollision(self.playerLeft)

		elif self.ball.x >= self.playerRight.x:
			self.ball.paddleCollision(self.playerRight)

		if self.ball.y <= Ball.demieSize or self.ball.y + Ball.demieSize >= Game.height:
			self.ball.dy = -self.ball.dy

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
			'paddle': Paddle.getSize(),
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
			self.x = Paddle.margin + Paddle.width
		elif self.side == 'right':
			self.x = Game.width - Paddle.width - Paddle.margin
		self.y = Game.height / 2

	async def send(self, type, message):
		await self.socket.send(type, message)


	async def move(self, input):
		if (input.get('ArrowUp') or input.get('KeyW')) and self.y > Paddle.demieHeight:
			self.y -= Paddle.speed
		elif (input.get('ArrowDown') or input.get('KeyS')) and self.y < Game.height - Paddle.demieHeight:
			self.y += Paddle.speed

	def getPos(self):
		if self.side == 'left':
			return {
				'x': self.x - Paddle.width,
				'y': self.y - Paddle.demieHeight,
				'score': self.score
			}
		elif self.side == 'right':
			return {
				'x': self.x,
				'y': self.y - Paddle.demieHeight,
				'score': self.score
			}

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
