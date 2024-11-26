from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async
from transcendence.settings import DEBUG
import game.models as models
import json
import asyncio
import random
import math
import time

MAX_SCORE = 5

class Matchmaking():
	_instance = None

	def __new__(cls):
		if cls._instance is None:
			cls._instance = super(Matchmaking, cls).__new__(cls)
			cls._instance.waiting_players = []
			cls._instance.tournaments = []
		return cls._instance

	async def addPlayerRemote(self, player):
		if len(self.waiting_players) > 0:
			player1 = None
			for waiting_player in self.waiting_players:
				if (player.user == waiting_player.user or \
					await self.isBlocked(player.user, waiting_player.user)) and not DEBUG:
					continue
				player1 = waiting_player
				break
			if player1:
				self.waiting_players.remove(player1)
				game = GameRemote(player1, player)
				await game.start()
				return
		self.waiting_players.append(player)

	async def removePlayerRemote(self, player):
		if player in self.waiting_players:
			self.waiting_players.remove(player)

	async def addPlayerAI(self, player):
		game = GameAI(player)
		await game.start()

	async def addPlayerFullAI(self, player):
		game = GameFullAI(player)
		await game.start()

	async def addPlayerLocal(self, player):
		game = Gamelocal(player)
		await game.start()

	async def addPlayerTournament(self, player):
		for tournament in self.tournaments:
			if not await tournament.addPlayers(player):
				continue
			if await tournament.run():
				self.tournaments.remove(tournament)
			return
		tournament = Tournament()
		self.tournaments.append(tournament)
		await tournament.addPlayers(player)

	async def removePlayerTournament(self, player):
		for tournament in self.tournaments:
			if not await tournament.removePlayers(player):
				continue

	@sync_to_async
	def isBlocked(self, player1, player2):
		P1Blocked = player1.profile.blocked_users.filter(pk=player2.pk).exists()
		P2Blocked = player2.profile.blocked_users.filter(pk=player1.pk).exists()
		return P1Blocked or P2Blocked

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
			return False

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
		return True


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
	maxScore = MAX_SCORE

	def __init__(self, player1, player2):
		self.playerLeft: Player = player1
		self.playerRight: Player = player2
		self.ball: Ball = Ball()
		self.timeLastPoint: float = 0
		self.running: bool = False
		self.exchanges = 0
		self.exchangesMax = 0
		self.exchangesActive = 0
		self.lastGoal = "Left"

	async def init(self):
		pass

	async def start(self):
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

	def setExchanges(self):
		self.exchanges += self.exchangesActive
		if self.exchangesActive > self.exchangesMax:
			self.exchangesMax = self.exchangesActive
		self.exchangesActive = 0

	def setGoalZone(self, player):
		if player.y < Game.height / 3:
			player.goalsUp += 1
		elif player.y < 2 * Game.height / 3:
			player.goalsMid += 1
		else:
			player.goalsDown += 1


	def checkCollision(self):
		if self.ball.x <= -Ball.size * 2:
			self.timeLastPoint = time.time()
			self.playerRight.score += 1
			self.setGoalZone(self.playerRight)
			self.lastGoal = "Right"
			self.setExchanges()
			if self.playerRight.score != Game.maxScore:
				self.ball.init()

		elif self.ball.x >= Game.width + Ball.size * 2:
			self.timeLastPoint = time.time()
			self.playerLeft.score += 1
			self.setGoalZone(self.playerLeft)
			self.lastGoal = "Left"
			self.setExchanges()
			if self.playerLeft.score != Game.maxScore:
				self.ball.init()
			self.ball.dx = -self.ball.dx

		elif self.ball.x <= self.playerLeft.x and self.ball.x >= self.playerLeft.x - self.ball.speed:
			collision = self.ball.paddleCollision(self.playerLeft)
			if collision and self.lastGoal == "Right":
				self.exchangesActive += 1

		elif self.ball.x >= self.playerRight.x and self.ball.x <= self.playerRight.x + self.ball.speed:
			collision = self.ball.paddleCollision(self.playerRight)
			if collision and self.lastGoal == "Left":
				self.exchangesActive += 1

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
			info['maxScore'] = Game.maxScore

		return info

class GameRemote(Game):

	def __init__(self, player1, player2):
		super().__init__(player1, player2)
		self.winner = None

	async def init(self):
		await self.playerLeft.init(self, 'left')
		await self.playerRight.init(self, 'right')
		self.ball.init()
		await self.send('game_init', self.getInfo(True))

	@sync_to_async
	def save(self):
		models.Match.objects.addMatch(self)

	async def send(self, type, message):
		await self.playerLeft.send(type, message)
		await self.playerRight.send(type, message)

	async def run(self):
		await self.init()
		while (not self.playerLeft.isReady and self.playerLeft.socket) or (not self.playerRight.isReady and self.playerRight.socket):
			await asyncio.sleep(0.1)
		await self.countdown()
		await self.send('game_start', None)
		while self.playerLeft.score != Game.maxScore and self.playerRight.score != Game.maxScore and self.playerLeft.socket and self.playerRight.socket:
			await self.loop()
		await self.end()

	@sync_to_async
	def checkUser(self, player):
		if not User.objects.filter(username=player.user.username).exists():
			player.user = User.objects.get(username="nobody")

	async def end(self):
		if not self.playerLeft.socket and not self.playerRight.socket:
			return

		await self.checkUser(self.playerLeft)
		await self.checkUser(self.playerRight)

		self.winner = self.playerLeft if self.playerLeft.score == Game.maxScore or not self.playerRight.socket else self.playerRight

		await self.send('game_end', {
			'winner': self.winner.side,
		})

		await self.save()
		self.running = False

	async def countdown(self):
		for i in range(3, 0, -1):
			if not self.playerLeft.socket or not self.playerRight.socket:
				return
			await self.send('game_countdown', i)
			await asyncio.sleep(1)
		await self.send('game_countdown', 'GO')
		await asyncio.sleep(1)

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
		await self.init()
		while not self.playerLeft.isReady or not self.playerLeft.socket:
			await asyncio.sleep(0.1)
		await self.countdown()
		await self.send('game_start', None)
		while self.playerLeft.score != Game.maxScore and self.playerRight.score != Game.maxScore and self.playerLeft.socket:
			await self.loop()
		await self.end()

	async def loop(self):
		self.playerRight.input = self.playerLeft.input
		await super().loop()

	async def end(self):
		if self.playerLeft.socket:
			await self.send('game_end', {
				'winner': 'left' if self.playerLeft.score == Game.maxScore else 'right',
				'leftPoint' : self.playerLeft.score,
				'rightPoint' : self.playerRight.score,
				'Game.maxScore' : Game.maxScore
			})
		self.running = False

class GameAI(GameRemote):

	def __init__(self, player1):
		super().__init__(player1, PlayerAI())

	async def send(self, type, message):
		await self.playerLeft.send(type, message)

	async def run(self):
		await self.init()
		asyncio.create_task(self.playerRight.run())
		while not self.playerLeft.isReady or not self.playerLeft.socket:
			await asyncio.sleep(0.1)
		await self.countdown()
		await self.send('game_start', None)
		while self.playerLeft.score != Game.maxScore and self.playerRight.score != Game.maxScore and self.playerLeft.socket:
			await self.loop()
		await self.end()

	async def end(self):
		await self.checkUser(self.playerLeft)

		self.winner = self.playerLeft if self.playerLeft.score == Game.maxScore else self.playerRight

		if self.playerLeft.socket:
			await self.send('game_end', {
				'winner': self.winner.side,
			})
		await self.save()
		self.running = False

	async def countdown(self):
		for i in range(3, 0, -1):
			if not self.playerLeft.socket:
				return
			await self.send('game_countdown', i)
			await asyncio.sleep(1)
		await self.send('game_countdown', 'GO')
		await asyncio.sleep(1)

class GameFullAI(Game):

	def __init__(self, player):
		super().__init__(PlayerAI(), PlayerAI())
		self.player = player


	async def init(self):
		await self.playerLeft.init(self, 'left')
		await self.playerRight.init(self, 'right')
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
		await self.init()
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
		self.goalsUp = 0
		self.goalsMid = 0
		self.goalsDown = 0

	def init(self, game, side):
		self.game = game
		self.score = 0
		self.side = side
		if self.side == 'left':
			self.x = Paddle.margin + Paddle.width
		elif self.side == 'right':
			self.x = Game.width - Paddle.width - Paddle.margin
		self.y = Game.demieHeight
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
		if socket:
			self.user = socket.scope['user']
		else:
			self.user = None
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
		if not self.user:
			self.user = User.objects.get(username='nobody')
		self.profile = self.user.profile

	async def send(self, type, message):
		try:
			await self.socket.send(type, message)
		except:
			self.socket = None

	def getInfo(self, init=False, tournament=False):
		info = super().getInfo()

		if init:
			info['user'] = {
				'username': self.user.username if not tournament else self.profile.display_name,
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
			ball = self.game.ball.copy()
			pad = self.copy()
			if (ball.dx > 0 and self.side == 'left') or (ball.dx < 0 and self.side == 'right'):
				await asyncio.sleep(1)
				continue

			timeStart = time.time()

			while time.time() - self.game.timeLastPoint > 2 and ball.x < self.game.playerRight.x and ball.x > self.game.playerLeft.x:
				ball.move()
				if ball.y <= Ball.demieSize or ball.y + Ball.demieSize >= Game.height:
					ball.dy = -ball.dy

			listY = [ball.y - Paddle.demieHeight + Paddle.speed / 2,
					ball.y - Paddle.demieHeight / 2,
					ball.y,
					ball.y + Paddle.demieHeight / 2,
					ball.y + Paddle.demieHeight - Paddle.speed / 2]
			listDeltaPlayer = []
			saveBall = ball

			for y in listY:
				pad.y = y
				ball = saveBall.copy()
				target_player = self.game.playerRight if self.side == 'left' else self.game.playerLeft

				ball.paddleCollision(pad)
				while (ball.x < target_player.x if self.side == 'left' else ball.x > target_player.x):
					ball.move()
					if ball.y <= Ball.demieSize or ball.y + Ball.demieSize >= Game.height:
						ball.dy = -ball.dy

				listDeltaPlayer.append(abs(ball.y - target_player.y))

			self.Y = listY[listDeltaPlayer.index(max(listDeltaPlayer))]
			timeEnd = time.time()

			if timeEnd - timeStart < 1:
				await asyncio.sleep(1 - timeEnd + timeStart)

	def move(self):
		if self.y < Game.height - Paddle.demieHeight and self.Y > self.y + Paddle.speed / 2:
			self.y += Paddle.speed
		elif self.y > Paddle.demieHeight and self.Y < self.y - Paddle.speed / 2:
			self.y -= Paddle.speed

	def getInfo(self, init=False):
		info = super().getInfo()

		if init:
			info['user'] = {
				'username': self.user.username,
				'profile_picture': self.profile.profile_picture
			}

		return info

	def copy(self):
		new_player = PlayerAI()
		new_player.__dict__.update(self.__dict__)
		return new_player

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
		if self.player:
			await Matchmaking().removePlayerRemote(self.player)
			await Matchmaking().removePlayerTournament(self.player)
			self.player.socket = None

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			type = data['type']
		except json.JSONDecodeError:
			await self.send('error', 'Invalid JSON')
			return
		except KeyError:
			await self.send('error', 'Invalid Data')
			return

		if not type or not isinstance(type, str):
			await self.send('error', 'Invalid Type')
			return

		if type == 'remote':
			self.player = PlayerRemote(self)
			await Matchmaking().addPlayerRemote(self.player)
			return

		elif type == 'tournament':
			self.player = PlayerRemote(self)
			await Matchmaking().addPlayerTournament(self.player)
			return

		elif type == 'ai':
			self.player = PlayerRemote(self)
			await Matchmaking().addPlayerAI(self.player)
			return

		elif type == 'full_ai':
			self.player = PlayerRemote(self)
			await Matchmaking().addPlayerFullAI(self.player)
			return

		elif type == 'local':
			self.player = PlayerLocal(self)
			await Matchmaking().addPlayerLocal(self.player)
			return

		elif self.player:
			if type == 'game_keydown':
				self.player.input = data['message']
			elif type == 'game_ready':
				self.player.isReady = True

		else:
			await self.send('error', 'Game mode unavailable')

	async def send(self, type, message):
		await super().send(text_data=json.dumps({
			'type': type,
			'message': message
		}))

class Tournament():
	_instance = None

	def __init__(self):
		self.matches = [[GameTournament(self, match, round) for match in range(2**(2 - round))] for round in range(3)]
		self.players = []
		self.model = None

	async def addPlayers(self, player):
		if len(self.players) >= 2**3:
			return False
		if not DEBUG:
			for tournamentPlayer in self.players:
				if player.user == tournamentPlayer.user or await self.isBlocked(player.user, tournamentPlayer.user):
					return False
		for i in range(len(self.matches[0])):
			if self.matches[0][i].playerLeft and self.matches[0][i].playerRight:
				continue
			if not self.matches[0][i].playerLeft:
				self.matches[0][i].playerLeft = player
			else:
				self.matches[0][i].playerRight = player
			self.players.append(player)
			await player.init(None, None)
			await self.send('tournament', self.getinfo())
			return True
		return False

	async def removePlayers(self, player):
		if player not in self.players:
			return False
		for i in range(len(self.matches[0])):
			if self.matches[0][i].playerLeft != player and self.matches[0][i].playerRight != player:
				continue
			if self.matches[0][i].playerLeft == player:
				self.matches[0][i].playerLeft = None
			else:
				self.matches[0][i].playerRight = None
			self.players.remove(player)
			await self.send('tournament', self.getinfo())
			return True
		return False

	async def run(self):
		if len(self.players) < 2**3:
			return False
		await self.setTournament()
		for match in self.matches[0]:
			await match.start()
		return True

	@sync_to_async
	def setTournament(self):
		self.model = models.TournamentModel(winner=User.objects.get(username='nobody'))
		self.model.save()

	async def moveWinner(self, round, match, side, winner):
		await winner.init(None, None)
		if round == 3:
			await self.end(winner)
			return

		if side == 0:
			self.matches[round][match].playerLeft = winner
		else:
			self.matches[round][match].playerRight = winner

		await self.send('tournament', self.getinfo())

		if self.matches[round][match].playerLeft and self.matches[round][match].playerRight:
			if self.matches[round][match].playerLeft.socket and self.matches[round][match].playerRight.socket:
				await asyncio.sleep(5)
			await self.matches[round][match].start()

	async def send(self, type, message):
		for player in self.players:
			if not player.inGame:
				await player.send(type, message)

	def getinfo(self):
		info = {}
		for round in range(len(self.matches)):
			info['round_' + str(round)] = {}
			for match in range(len(self.matches[round])):
				info['round_' + str(round)]['match_' + str(match)] = self.matches[round][match].getMatch()
		return info

	async def end(self, winner):
		await self.send('tournament', self.getinfo())
		await self.send('tournament_end', {
			'winner': winner.user.username,
			'profile_picture': winner.profile.profile_picture
		})
		await self.save(winner)

	@sync_to_async
	def save(self, winner):
		for player in self.players:
			if User.objects.filter(username=player.user.username).exists():
				player.user.profile.tournaments.add(self.model)
		self.model.winner = winner.user
		self.model.save()

	@sync_to_async
	def isBlocked(self, player1, player2):
		P1Blocked = player1.profile.blocked_users.filter(pk=player2.pk).exists()
		P2Blocked = player2.profile.blocked_users.filter(pk=player1.pk).exists()
		return P1Blocked or P2Blocked

class GameTournament(GameRemote):
	def __init__(self, tournament, match, round):
		super().__init__(None, None)
		self.tournament = tournament
		self.match = match
		self.round = round
		self.winnerSide = None

	async def start(self):
		self.playerLeft.inGame = True
		self.playerRight.inGame = True
		await super().start()

	@sync_to_async
	def save(self):
		self.tournament.model.addMatchToTournament(self)

	async def run(self):
		for i in range(50):
			await asyncio.sleep(0.1)
		if self.playerLeft.socket and self.playerRight.socket:
			await super().run()
		else:
			await self.playerLeft.init(self, 'left')
			await self.playerRight.init(self, 'right')
			await self.end()

	async def end(self):
		await self.checkUser(self.playerLeft)
		await self.checkUser(self.playerRight)

		if self.playerLeft.socket or self.playerRight.socket:
			self.winner = self.playerLeft if self.playerLeft.score == Game.maxScore or not self.playerRight.socket else self.playerRight
			self.playerLeft.inGame = False
			self.playerRight.inGame = False
			self.winnerSide = self.winner.side

			await self.send('game_match_end', {
				'winner': self.winnerSide,
			})

			if self.winnerSide == 'left':
				self.playerLeft = self.playerLeft.copy()
			else:
				self.playerRight = self.playerRight.copy()
		else:
			self.winner =PlayerRemote(None)
			await self.winner.init(None, None)
			self.winnerSide = "None"

		self.running = False

		await self.save()
		await self.tournament.moveWinner(self.round + 1, self.match // 2, self.match % 2, self.winner)

	def getMatch(self):
		return {
			'playerLeft': {
				'username': self.playerLeft.profile.user.username if self.playerLeft else None,
				'display_name': self.playerLeft.profile.display_name if self.playerLeft else None,
				'profile_picture': self.playerLeft.profile.profile_picture if self.playerLeft else None,
				'winner': self.winnerSide == "left" if self.winner else None,
				'score': self.playerLeft.score if self.playerLeft and self.winner else None
			},
			'playerRight': {
				'username': self.playerRight.profile.user.username if self.playerRight else None,
				'display_name': self.playerRight.profile.display_name if self.playerRight else None,
				'profile_picture': self.playerRight.profile.profile_picture if self.playerRight else None,
				'winner': self.winnerSide == "right" if self.winner else None,
				'score': self.playerRight.score if self.playerRight and self.winner  else None
			}
		}

	def getInfo(self, init=False):
		info = {
			'player1': self.playerLeft.getInfo(init, True),
			'player2': self.playerRight.getInfo(init, True),
			'ball': self.ball.getInfo()
		}

		if init:
			info['canvas'] = Game.getSize()
			info['paddle'] = Paddle.getSize()
			info['maxScore'] = Game.maxScore

		return info
