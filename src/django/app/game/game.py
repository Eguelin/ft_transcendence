import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
import random
import math
import time

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
			player1 = self.waiting_players.pop(0)
			player2 = self.waiting_players.pop(0)
			return player1, player2
		return None, None

	async def run(self):
		player1, player2 = self.match_players()
		if player1 and player2:
			game = Game(player1, player2)
			await game.initGame()

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


	def getInfo(self):
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

	def __init__(self, player1, player2):
		self.playerLeft = player1
		self.playerRight = player2
		self.ball = Ball()
		self.timeLastPoint = 0

		self.playerLeft.initPosition(self, 'left')
		self.playerRight.initPosition(self, 'right')
		self.ball.initPosition()

	async def initGame(self):
		await self.send('game_init', self.getInfo(True))
		asyncio.create_task(self.updateGame())

	async def updateGame(self):
		await self.countdown()

		await self.send('game_start', None)
		while True:
			if time.time() - self.timeLastPoint > 2:
				self.ball.move()
			self.playerLeft.move()
			self.playerRight.move()
			self.checkCollision()
			if await self.endGame():
				break
			await self.send('game_update', self.getInfo())
			await asyncio.sleep(0.016)

	async def endGame(self):
		if self.playerLeft.score == 5:
			await self.playerLeft.send('game_end', 'You win')
			await self.playerRight.send('game_end', 'You lose')
			return True

		if self.playerRight.score == 5:
			await self.playerLeft.send('game_end', 'You lose')
			await self.playerRight.send('game_end', 'You win')
			return True

		return False

	async def countdown(self):
		for i in range(3, 0, -1):
			await self.send('game_update', i)
			await asyncio.sleep(1)
		await self.send('game_update', 'GO')
		await asyncio.sleep(1)

	def checkCollision(self):
		if self.ball.x <= -Ball.size * 2:
			self.timeLastPoint = time.time()
			self.playerRight.score += 1
			self.ball.initPosition()

		elif self.ball.x >= Game.width + Ball.size * 2:
			self.timeLastPoint = time.time()
			self.playerLeft.score += 1
			self.ball.initPosition()
			self.ball.dx = -self.ball.dx

		elif self.ball.x <= self.playerLeft.x and self.ball.x >= self.playerLeft.x - Paddle.width:
			self.ball.paddleCollision(self.playerLeft)

		elif self.ball.x >= self.playerRight.x and self.ball.x <= self.playerRight.x + Paddle.width:
			self.ball.paddleCollision(self.playerRight)

		if self.ball.y <= Ball.demieSize or self.ball.y + Ball.demieSize >= Game.height:
			self.ball.dy = -self.ball.dy

	async def send(self, type, message):
		await self.playerLeft.send(type, message)
		await self.playerRight.send(type, message)

	def getSize():
		return {
			'width': Game.width,
			'height': Game.height
		}

	def getInfo(self, init=False):
		info = {
			'player1': self.playerLeft.getInfo(init),
			'player2': self.playerRight.getInfo(init),
			'ball': self.ball.getInfo()
		}

		if init:
			info['canvas'] = Game.getSize()
			info['paddle'] = Paddle.getSize()

		return info

class Player():

	def __init__(self, socket):
		self.x = 0
		self.y = 0
		self.score = 0
		self.game = None
		self.side = None
		self.socket = socket
		self.input = {
			'ArrowUp': False,
			'ArrowDown': False,
			'KeyW': False,
			'KeyS': False
		}
		self.scope = socket.scope

	def initPosition(self, game, side):
		self.game = game
		self.score = 0
		self.side = side
		if self.side == 'left':
			self.x = Paddle.margin + Paddle.width
		elif self.side == 'right':
			self.x = Game.width - Paddle.width - Paddle.margin
		self.y = Game.height / 2

	def move(self):
		if (self.input['ArrowUp'] or self.input['KeyW']) and self.y > Paddle.demieHeight:
			self.y -= Paddle.speed
		if (self.input['ArrowDown'] or self.input['KeyS']) and self.y < Game.height - Paddle.demieHeight:
			self.y += Paddle.speed

	async def send(self, type, message):
		await self.socket.send(type, message)

	def getInfo(self, init=False):
		info = {
			'x': self.x,
			'y': self.y - Paddle.demieHeight,
			'score': self.score,
		}

		if self.side == 'left':
			info['x'] = self.x - Paddle.width

		if init:
			info['user_id'] = self.scope['user'].id

		return info

class GameConsumer(AsyncWebsocketConsumer):
	matchmaking = Matchmaking()

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.player = None

	async def connect(self):
		await self.accept()
		self.player = Player(self)
		self.matchmaking.add_player(self.player)
		await self.matchmaking.run()

	async def disconnect(self, close_code):
		self.matchmaking.remove_player(self.player)

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data['type'] == 'game_keydown':
			self.player.input = data['message']

	async def send(self, type, message):
		await super().send(text_data=json.dumps({
			'type': type,
			'message': message
		}))
