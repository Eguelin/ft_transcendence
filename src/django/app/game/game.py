from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async
import game.models as models
import json
import asyncio
import random
import math
import time

maxScore = 1

class Matchmaking():
	_instance = None

	def __new__(cls):
		if cls._instance is None:
			cls._instance = super(Matchmaking, cls).__new__(cls)
			cls._instance.waiting_players = []
		return cls._instance

	def add_PlayerRemote(self, player):
		self.waiting_players.append(player)

	def remove_PlayerRemote(self, player):
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
			game = GameRemote(player1, player2)
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
		self.x = Game.demieWidth
		self.y = Game.demieHeight
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

		if self.speed < 12:
			self.speed += 1

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
	height = 100
	demieWidth = width / 2
	demieHeight = height / 2
	speed = 6
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
		self.playerLeft: Player = player1
		self.playerRight: Player = player2
		self.ball: Ball = Ball()
		self.timeLastPoint: float = 0
		self.running: bool = False

	async def init(self):
		pass

	async def start(self):
		await self.init()
		self.running = True
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
			if self.playerRight.score != maxScore:
				self.ball.init()

		elif self.ball.x >= Game.width + Ball.size * 2:
			self.timeLastPoint = time.time()
			self.playerLeft.score += 1
			if self.playerLeft.score != maxScore:
				self.ball.init()
			self.ball.dx = -self.ball.dx

		elif self.ball.x <= self.playerLeft.x and self.ball.x >= self.playerLeft.x - self.ball.speed:
			self.ball.paddleCollision(self.playerLeft)

		elif self.ball.x >= self.playerRight.x and self.ball.x <= self.playerRight.x + self.ball.speed:
			self.ball.paddleCollision(self.playerRight)

		if self.ball.y <= Ball.demieSize or self.ball.y + Ball.demieSize >= Game.height:
			self.ball.dy = -self.ball.dy

	async def send(self, type, message):
		pass

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

class GameRemote(Game):

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
		while not self.playerLeft.isReady or not self.playerRight.isReady or not self.playerLeft.socket or not self.playerRight.socket:
			await asyncio.sleep(0.1)
		await self.countdown()
		await self.send('game_start', None)
		while self.playerLeft.score != maxScore and self.playerRight.score != maxScore and self.playerLeft.socket and self.playerRight.socket:
			await self.loop()
		await self.end()

	async def end(self):
		if not self.playerLeft.socket and not self.playerRight.socket:
			return
		await self.send('game_end', {
			'winner': 'left' if self.playerLeft.score == maxScore or not self.playerRight.socket else 'right'
		})
		await self.save()
		self.running = False

class Gamelocal(Game):

	def __init__(self, player):
		super().__init__(player, player.copy())

	async def init(self):
		await self.playerLeft.init(self, 'left')
		await self.playerRight.init(self, 'right')
		self.ball.init()
		await self.send('game_init', self.getInfo(True))

	async def send(self, type, message):
		await self.playerLeft.send(type, message)

	async def run(self):
		while not self.playerLeft.isReady or not self.playerLeft.socket:
			await asyncio.sleep(0.1)
		await self.countdown()
		await self.send('game_start', None)
		while self.playerLeft.score != maxScore and self.playerRight.score != maxScore and self.playerLeft.socket:
			await self.loop()
		await self.end()

	async def loop(self):
		self.playerRight.input = self.playerLeft.input
		await super().loop()

	async def end(self):
		if self.playerLeft.socket:
			await self.send('game_end', {
				'winner': 'left' if self.playerLeft.score == maxScore else 'right',
				'leftPoint' : self.playerLeft.score,
				'rightPoint' : self.playerRight.score,
				'maxScore' : maxScore
			})
		self.running = False

class GameAI(Game):

	def __init__(self, player1):
		super().__init__(player1, PlayerAI())

	async def init(self):
		await self.playerLeft.init(self, 'left')
		await self.playerRight.init(self, 'right')
		self.ball.init()
		asyncio.create_task(self.playerRight.run())
		await self.send('game_init', self.getInfo(True))

	@sync_to_async
	def save(self):
		models.Match.objects.addMatch(self.playerLeft, self.playerRight)

	async def send(self, type, message):
		await self.playerLeft.send(type, message)

	async def run(self):
		while not self.playerLeft.isReady or not self.playerLeft.socket:
			await asyncio.sleep(0.1)
		await self.countdown()
		await self.send('game_start', None)
		while self.playerLeft.score != maxScore and self.playerRight.score != maxScore and self.playerLeft.socket:
			await self.loop()
		await self.end()

	async def end(self):
		if self.playerLeft.socket:
			await self.send('game_end', {
				'winner': 'left' if self.playerLeft.score == maxScore else 'right'
			})
		await self.save()
		self.running = False

class GameFullAI(Game):

	def __init__(self, player):
		super().__init__(PlayerAI(), PlayerAI())
		self.player = player


	async def init(self):
		self.playerLeft.init(self, 'left')
		self.playerRight.init(self, 'right')
		self.ball.init()
		asyncio.create_task(self.playerRight.run())
		asyncio.create_task(self.playerLeft.run())
		await self.send('game_init', self.getInfo(True))

	def checkCollision(self):
		if self.ball.x <= -Ball.size * 2:
			self.timeLastPoint = time.time()
			self.playerRight.score += 1
			self.ball.init()

		elif self.ball.x >= Game.width + Ball.size * 2:
			self.timeLastPoint = time.time()
			self.playerLeft.score += 1
			self.ball.init()
			self.ball.dx = -self.ball.dx

		elif self.ball.x <= self.playerLeft.x and self.ball.x >= self.playerLeft.x - self.ball.speed:
			self.ball.paddleCollision(self.playerLeft)

		elif self.ball.x >= self.playerRight.x and self.ball.x <= self.playerRight.x + self.ball.speed:
			self.ball.paddleCollision(self.playerRight)

		if self.ball.y <= Ball.demieSize or self.ball.y + Ball.demieSize >= Game.height:
			self.ball.dy = -self.ball.dy

	async def send(self, type, message):
		await self.player.send(type, message)

	async def run(self):
		await self.countdown()
		await self.send('game_start', None)
		while self.player.socket:
			await self.loop()
		await self.end()

	async def end(self):
		self.running = False

class Player():

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
			self.x = Game.width - Paddle.width - Paddle.margin
		self.y = Game.height / 2
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

class PlayerRemote(Player):

	def __init__(self, socket):
		super().__init__()
		self.socket = socket
		self.user = socket.scope['user']
		self.input = {}
		self.profile = None
		self.inGame = False

	def hasAndIsInput(self, keyName):
		return (self.input.get(keyName) and self.input[keyName])

	def move(self):
		if ((self.hasAndIsInput('ArrowUp') or self.hasAndIsInput('ArrowRight')) or (self.hasAndIsInput('KeyW') or self.hasAndIsInput('KeyD'))) and self.y > Paddle.demieHeight:
			self.y -= Paddle.speed
		if ((self.hasAndIsInput('ArrowDown') or self.hasAndIsInput('ArrowLeft')) or (self.hasAndIsInput('KeyS') or self.hasAndIsInput('KeyA'))) and self.y < Game.height - Paddle.demieHeight:
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

	def copy(self):
		new_player = PlayerRemote(self.socket)
		new_player.__dict__.update(self.__dict__)
		new_player.socket = None
		return new_player

class PlayerAI(Player):

	def __init__(self):
		super().__init__()

	@sync_to_async
	def init(self, game, side):
		super().init(game, side)
		self.user = User.objects.get(username='AI')
		self.profile = self.user.profile
		self.Y = Game.demieHeight


	async def run(self):
		while self.game.running:
			rand = random.uniform(0, Paddle.height)
			ball = self.game.ball.copy()
			if (ball.dx > 0 and self.side == 'right') or (ball.dx < 0 and self.side == 'left'):
				while time.time() - self.game.timeLastPoint > 2 and ball.x < self.game.playerRight.x and ball.x > self.game.playerLeft.x:
					ball.move()
					if ball.y <= Ball.demieSize or ball.y + Ball.demieSize >= Game.height:
						ball.dy = -ball.dy
				if self.y < ball.y:
					self.Y = ball.y + rand
				else:
					self.Y = ball.y - rand
			await asyncio.sleep(1)

	def move(self):
		if self.y < Game.height - Paddle.demieHeight and self.Y > self.y + Paddle.demieHeight:
			self.y += Paddle.speed
		elif self.y > Paddle.demieHeight and self.Y < self.y - Paddle.demieHeight:
			self.y -= Paddle.speed

	def getInfo(self, init=False):
		info = super().getInfo()

		if init:
			info['user'] = {
				'username': 'AI',
				'profile_picture': '/images/defaults/defaultAi.gif'
			}

		return info

class PlayerLocal(PlayerRemote):

	def move(self):
		if (((self.hasAndIsInput('ArrowUp') or self.hasAndIsInput('ArrowRight')) and self.side == 'right') or ((self.hasAndIsInput('KeyW') or self.hasAndIsInput('KeyD')) and self.side == 'left')) and self.y > Paddle.demieHeight:
			self.y -= Paddle.speed
		if (((self.hasAndIsInput('ArrowDown') or self.hasAndIsInput('ArrowLeft')) and self.side == 'right') or ((self.hasAndIsInput('KeyS') or self.hasAndIsInput('KeyA')) and self.side == 'left')) and self.y < Game.height - Paddle.demieHeight:
			self.y += Paddle.speed

	def copy(self):
		new_player = PlayerLocal(self.socket)
		new_player.__dict__.update(self.__dict__)
		return new_player

class GameConsumer(AsyncWebsocketConsumer):

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.player = None

	async def connect(self):
		if not self.scope['user'].is_authenticated:
			await self.close()
		await self.accept()

	async def disconnect(self, close_code):
		Matchmaking().remove_PlayerRemote(self.player)
		await TournamentMaking().removePlayers(self.player)
		self.player.socket = None

	async def receive(self, text_data):
		data = json.loads(text_data)
		if ("type" in data):
			if self.player:
				if data['type'] == 'game_keydown':
					self.player.input = data['message']
				elif data['type'] == 'game_ready':
					self.player.isReady = True

			elif data['type'] == 'remote':
				self.player = PlayerRemote(self)
				Matchmaking().add_PlayerRemote(self.player)
				await Matchmaking().run()
				return

			elif data['type'] == 'tournament':
				self.player = PlayerRemote(self)
				await TournamentMaking().addPlayers(self.player)
				await TournamentMaking().run()
				return

			elif data['type'] == 'ai':
				self.player = PlayerRemote(self)
				game = GameAI(self.player)
				await game.start()
				return

			elif data['type'] == 'full_ai':
				self.player = PlayerRemote(self)
				game = GameFullAI(self.player)
				await game.start()
				return

			elif data['type'] == 'local':
				self.player = PlayerLocal(self)
				game = Gamelocal(self.player)
				await game.start()
				return
			else:
				await self.send('error', 'Game mode unavailable')

	async def send(self, type, message):
		await super().send(text_data=json.dumps({
			'type': type,
			'message': message
		}))

class TournamentMaking():
	_instance = None

	def __new__(cls):
		if cls._instance is None:
			cls._instance = super(TournamentMaking, cls).__new__(cls)
			cls._instance.matches = [[GameTournament(cls._instance, match, round) for match in range(2**round)] for round in range(3)]
			cls._instance.running = False
			cls._instance.players = []
			cls._instance.tournament = None
		return cls._instance

	async def addPlayers(self, player):
		if self.running:
			return
		for i in range(len(self.matches[-1])):
			if not self.matches[-1][i].playerLeft or not self.matches[-1][i].playerRight:
				if not self.matches[-1][i].playerLeft:
					self.matches[-1][i].playerLeft = player
				else:
					self.matches[-1][i].playerRight = player
				self.players.append(player)
				if len(self.players) == len(self.matches[-1]) * 2:
					self.running = True
				await player.init(None, None)
				await self.send('tournament', self.getinfo())
				break

	async def removePlayers(self, player):
		if self.running:
			return
		for i in range(len(self.matches[-1])):
			if self.matches[-1][i].playerLeft == player or self.matches[-1][i].playerRight == player:
				if self.matches[-1][i].playerLeft == player:
					self.matches[-1][i].playerLeft = None
				else:
					self.matches[-1][i].playerRight = None
				self.players.remove(player)
				await self.send('tournament', self.getinfo())
				break

	async def run(self):
		if not self.running:
			return
		for match in self.matches[-1]:
			await match.start()
		await self.createTournament()
		TournamentMaking._instance = None

	@sync_to_async
	def createTournament(self):
		self.tournament = models.Tournament.objects.createTournament([player.user for player in self.players])

	async def moveWinner(self, round, match, winner):
		await winner.init(None, None)
		if round == -1:
			await self.send('tournament', self.getinfo())
			await self.send('tournament_end', {
				'winner': winner.user.username,
				'profile_picture': winner.profile.profile_picture
			})
			return

		if not self.matches[round][match].playerLeft:
			self.matches[round][match].playerLeft = winner
		else:
			self.matches[round][match].playerRight = winner

		await self.send('tournament', self.getinfo())

		if self.matches[round][match].playerLeft and self.matches[round][match].playerRight:
			await asyncio.sleep(3)
			await self.matches[round][match].start()

	async def send(self, type, message):
		for player in self.players:
			if not player.inGame:
				await player.send(type, message)

	def getinfo(self):
		info = {}
		for round in range(-1, -len(self.matches) - 1, -1):
			info['round_' + str(-round)] = {}
			for match in range(len(self.matches[round])):
				info['round_' + str(-round)]['match_' + str(match)] = self.matches[round][match].getMatch()
		return info

class GameTournament(GameRemote):
	def __init__(self, tournamentMaking, match, round):
		super().__init__(None, None)
		self.tournamentMaking = tournamentMaking
		self.match = match
		self.round = round
		self.winner = None

	async def start(self):
		self.playerLeft.inGame = True
		self.playerRight.inGame = True
		await super().start()

	@sync_to_async
	def save(self):
		models.Tournament.objects.addMatchToTournament(self)

	async def end(self):
		self.winner = self.playerLeft if self.playerLeft.score == maxScore or not self.playerRight.socket else self.playerRight
		self.playerLeft.inGame = False
		self.playerRight.inGame = False

		if self.winner.side == 'left':
			self.playerLeft = self.playerLeft.copy()
		else:
			self.playerRight = self.playerRight.copy()

		await self.send('game_match_end', {
			'winner': self.winner.side,
		})

		self.running = False

		await self.save()
		await asyncio.sleep(3)
		await self.tournamentMaking.moveWinner(self.round - 1, self.match // 2, self.winner)

	def getMatch(self):
		return {
			'playerLeft': {
				'username': self.playerLeft.user.username if self.playerLeft else None,
				'profile_picture': self.playerLeft.profile.profile_picture if self.playerLeft and self.playerLeft.profile else None,
				'winner': self.winner == "left" if self.winner else None,
				'score': self.playerLeft.score if self.playerLeft and self.winner else None
			},
			'playerRight': {
				'username': self.playerRight.user.username if self.playerRight else None,
				'profile_picture': self.playerRight.profile.profile_picture if self.playerRight and self.playerRight.profile else None,
				'winner': self.winner == "right" if self.winner else None,
				'score': self.playerRight.score if self.playerRight and self.winner  else None
			}
		}
