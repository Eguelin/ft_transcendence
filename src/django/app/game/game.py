from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import game.models as models
import json
import asyncio
import random
import math
import time
import copy

class Matchmaking():

	def __init__(self):
		self.waiting_players = []

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
			await game.start()

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

	def init(self):
		self.x = GameTemplate.demieWidth
		self.y = GameTemplate.demieHeight
		self.speed = 3

		self.angle = random.uniform(2 * math.pi / 3, 4 * math.pi / 3)
		self.dx = math.cos(self.angle) * self.speed
		self.dy = math.sin(self.angle) * self.speed

	def move(self):
		self.x += self.dx
		self.y += self.dy

	def paddleCollision(self, pad):
		if self.y < pad.y - Paddle.demieHeight - Ball.demieSize or self.y > pad.y + Paddle.demieHeight + Ball.demieSize:
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

	def copy(self):
		new_ball = Ball()
		new_ball.__dict__.update(self.__dict__)
		return new_ball

class Paddle():
	width = 8
	height = 120
	demieWidth = width / 2
	demieHeight = height / 2
	speed = 4
	margin = 4

	def getSize():
		return {
			'width': Paddle.width,
			'height': Paddle.height
		}

class GameTemplate():
	width = 800
	height = 600
	demieWidth = width / 2
	demieHeight = height / 2

	def __init__(self, player1, player2):
		self.playerLeft: PlayerTemplate = player1
		self.playerRight: PlayerTemplate = player2
		self.ball: Ball = Ball()
		self.timeLastPoint: float = 0

	async def init(self):
		pass

	async def start(self):
		await self.init()
		asyncio.create_task(self.run())

	async def run(self):
		pass

	async def loop(self):
		if time.time() - self.timeLastPoint > 2:
			self.ball.move()
		self.playerLeft.move()
		self.playerRight.move()
		self.checkCollision()
		await self.send('game_update', self.getInfo())
		await asyncio.sleep(0.016)

	async def end(self):
		pass

	async def countdown(self):
		for i in range(3, 0, -1):
			await self.send('game_countdown', i)
			await asyncio.sleep(1)
		await self.send('game_countdown', 'GO')
		await asyncio.sleep(1)

	def checkCollision(self):
		if self.ball.x <= -Ball.size * 2:
			self.timeLastPoint = time.time()
			self.playerRight.score += 1
			if self.playerRight.score != 5:
				self.ball.init()

		elif self.ball.x >= GameTemplate.width + Ball.size * 2:
			self.timeLastPoint = time.time()
			self.playerLeft.score += 1
			if self.playerLeft.score != 5:
				self.ball.init()
			self.ball.dx = -self.ball.dx

		elif self.ball.x <= self.playerLeft.x and self.ball.x >= self.playerLeft.x - Paddle.width:
			self.ball.paddleCollision(self.playerLeft)

		elif self.ball.x >= self.playerRight.x and self.ball.x <= self.playerRight.x + Paddle.width:
			self.ball.paddleCollision(self.playerRight)

		if self.ball.y <= Ball.demieSize or self.ball.y + Ball.demieSize >= GameTemplate.height:
			self.ball.dy = -self.ball.dy

	async def send(self, type, message):
		pass

	def getSize():
		return {
			'width': GameTemplate.width,
			'height': GameTemplate.height
		}

	def getInfo(self, init=False):
		info = {
			'player1': self.playerLeft.getInfo(init),
			'player2': self.playerRight.getInfo(init),
			'ball': self.ball.getInfo()
		}

		if init:
			info['canvas'] = GameTemplate.getSize()
			info['paddle'] = Paddle.getSize()

		return info

class Game(GameTemplate):

	def __init__(self, player1, player2):
		super().__init__(player1, player2)

	async def init(self):
		await self.playerLeft.init(self, 'left')
		await self.playerRight.init(self, 'right')
		self.ball.init()
		await self.send('game_init', self.getInfo(True))

	@sync_to_async
	def save(self):
		models.Match.objects.addMatch(self.playerLeft, self.playerRight)

	async def send(self, type, message):
		await self.playerLeft.send(type, message)
		await self.playerRight.send(type, message)

	async def run(self):
		while not self.playerLeft.isReady or not self.playerRight.isReady:
			await asyncio.sleep(0.1)
		await self.countdown()
		if not self.playerLeft.socket or not self.playerRight.socket:
			return
		await self.send('game_start', None)
		while self.playerLeft.score != 5 and self.playerRight.score != 5 and self.playerLeft.socket and self.playerRight.socket:
			await self.loop()
		await self.end()

	async def end(self):
		if not self.playerLeft.socket and not self.playerRight.socket:
			return
		await self.playerLeft.send('game_end', {
			'winner': self.playerLeft.score == 5 or not self.playerRight.socket
		})
		await self.playerRight.send('game_end', {
			'winner': self.playerRight.score == 5 or not self.playerLeft.socket
		})
		await self.save()

class Gamelocal(GameTemplate):

	def __init__(self, player):
		super().__init__(player, player.copy())

	async def init(self):
		await self.playerLeft.init(self, 'left')
		await self.playerRight.init(self, 'right')
		self.ball.init()
		await self.send('game_init', self.getInfo(True))

	@sync_to_async
	def save(self):
		pass

	async def send(self, type, message):
		await self.playerLeft.send(type, message)

	async def run(self):
		while not self.playerLeft.isReady:
			await asyncio.sleep(0.1)
		await self.countdown()
		await self.send('game_start', None)
		while self.playerLeft.score != 5 and self.playerRight.score != 5 and self.playerLeft.socket:
			await self.loop()
		await self.end()

	async def loop(self):
		self.playerRight.input = self.playerLeft.input
		await super().loop()

	async def end(self):
		if not self.playerLeft.socket:
			await self.playerLeft.send('game_end', {
				'winner': 'left' if self.playerLeft.score == 5 else 'right'
			})
		await self.save()

class GameAI(GameTemplate):

	def __init__(self, player1):
		super().__init__(player1, PlayerAI())

	async def init(self):
		await self.playerLeft.init(self, 'left')
		self.playerRight.init(self, 'right')
		self.ball.init()
		asyncio.create_task(self.playerRight.run())
		await self.send('game_init', self.getInfo(True))

	@sync_to_async
	def save(self):
		pass

	async def send(self, type, message):
		await self.playerLeft.send(type, message)

	async def run(self):
		while not self.playerLeft.isReady:
			await asyncio.sleep(0.1)
		await self.countdown()
		await self.send('game_start', None)
		while self.playerLeft.score != 5 and self.playerRight.score != 5 and self.playerLeft.socket:
			await self.loop()
		await self.end()

	async def end(self):
		if self.playerLeft.socket:
			await self.playerLeft.send('game_end', {
				'winner': self.playerLeft.score == 5
			})
		await self.save()

class PlayerTemplate():

	def __init__(self):
		self.x = 0
		self.y = 0
		self.score = 0
		self.game = None
		self.side = None
		self.isReady = False

	def init(self, game, side):
		self.game = game
		self.score = 0
		self.side = side
		if self.side == 'left':
			self.x = Paddle.margin + Paddle.width
		elif self.side == 'right':
			self.x = GameTemplate.width - Paddle.width - Paddle.margin
		self.y = GameTemplate.height / 2
		self.isReady = False

	def move(self):
		pass

	def getInfo(self):
		info = {
			'x': self.x,
			'y': self.y - Paddle.demieHeight,
			'score': self.score,
		}

		if self.side == 'left':
			info['x'] = self.x - Paddle.width

		return info

class Player(PlayerTemplate):

	def __init__(self, socket):
		super().__init__()
		self.socket = socket
		self.user = socket.scope['user']
		self.input = {}
		self.profile = None

	def move(self):
		if ((self.input.get('ArrowUp') and self.input['ArrowUp']) or (self.input.get('KeyW') and self.input['KeyW'])) and self.y > Paddle.demieHeight:
			self.y -= Paddle.speed
		if ((self.input.get('ArrowDown') and self.input['ArrowDown']) or (self.input.get('KeyS') and self.input['KeyS'])) and self.y < GameTemplate.height - Paddle.demieHeight:
			self.y += Paddle.speed

	@sync_to_async
	def init(self, game, side):
		super().init(game, side)
		self.input = {}
		self.profile = self.user.profile

	async def send(self, type, message):
		try:
			await self.socket.send(type, message)
		except:
			self.socket = None

	def getInfo(self, init=False):
		info = super().getInfo()

		if init:
			info['user'] = {
				'username': self.user.username,
				'profile_picture': self.profile.profile_picture
			}

		return info

class PlayerAI(PlayerTemplate):

	def __init__(self):
		super().__init__()

	def init(self, game, side):
		super().init(game, side)
		self.Y = 0

	async def run(self):
		while True:
			ball = self.game.ball.copy()
			while ball.x < self.x:
				ball.move()
			self.Y = ball.y
			await asyncio.sleep(1)

	def move(self):
		if self.y < GameTemplate.height - Paddle.demieHeight and self.Y > self.y + Paddle.demieHeight:
			self.y += Paddle.speed
		elif self.y > Paddle.demieHeight and self.Y < self.y - Paddle.demieHeight:
			self.y -= Paddle.speed

	def getInfo(self, init=False):
		info = super().getInfo()

		if init:
			info['user'] = {
				'username': 'AI',
				'profile_picture': 'ai.png'
			}

		return info

class PlayerLocal(Player):

	def move(self):
		if ((self.input.get('ArrowUp') and self.input['ArrowUp'] and self.side == 'right') or (self.input.get('KeyW') and self.input['KeyW'] and self.side == 'left')) and self.y > Paddle.demieHeight:
			self.y -= Paddle.speed
		if ((self.input.get('ArrowDown') and self.input['ArrowDown'] and self.side == 'right') or (self.input.get('KeyS') and self.input['KeyS'] and self.side == 'left')) and self.y < GameTemplate.height - Paddle.demieHeight:
			self.y += Paddle.speed

	def copy(self):
		new_player = PlayerLocal(self.socket)
		new_player.__dict__.update(self.__dict__)
		return new_player

MATCHMAKING = Matchmaking()

class GameConsumer(AsyncWebsocketConsumer):

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.player = None

	async def connect(self):
		if not self.scope['user'].is_authenticated:
			await self.close()
		await self.accept()
		# self.player = PlayerLocal(self)
		# game = Gamelocal(self.player)
		# await game.start()
		self.player = Player(self)
		game = GameAI(self.player)
		await game.start()
		# MATCHMAKING.add_player(self.player)
		# await MATCHMAKING.run()

	async def disconnect(self, close_code):
		MATCHMAKING.remove_player(self.player)
		self.player.socket = None

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data['type'] == 'game_keydown':
			self.player.input = data['message']
		elif data['type'] == 'game_ready':
			self.player.isReady = True

	async def send(self, type, message):
		await super().send(text_data=json.dumps({
			'type': type,
			'message': message
		}))
