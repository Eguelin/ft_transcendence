from django.db import models
from django.contrib.auth.models import User
import game.game as Player
import datetime
import random

class MatchManager(models.Manager):
	def createWithRandomOpps(self, creator):
		startDate = datetime.datetime(2024,1,1)
		endDate = datetime.datetime(2024,12,31)

		try:
			player_two = User.objects.get(username="random")
		except:
			player_two = User.objects.get_or_create(username="random")[0]
			player_two.save()
		match = self.create(player_one=creator, player_two=player_two)
		match.player_one_pts = random.randint(0, 10)
		match.player_two_pts = random.randint(0, 10)
		match.save()
		match.date = startDate + datetime.timedelta(seconds=random.randint(0, int((endDate - startDate).total_seconds())))
		match.save()
		player_two.profile.matches.add(match)
		return match

	def createWithTwoOpps(self, userOne, userTwo):
		startDate = datetime.datetime(2024,1,1)
		endDate = datetime.datetime(2024,12,31)

		try:
			player_one = User.objects.get(username=userOne)
		except:
			player_one = User.objects.get_or_create(username=userOne)[0]
			player_one.save()

		try:
			player_two = User.objects.get(username=userTwo)
		except:
			player_two = User.objects.get_or_create(username=userTwo)[0]
			player_two.save()

		match = self.create(player_one=player_one, player_two=player_two)
		match.player_one_pts = random.randint(0, 10)
		match.player_two_pts = random.randint(0, 10)
		match.save()
		match.winner = player_one if match.player_one_pts > match.player_two_pts else player_two
		match.save()
		match.date = startDate + datetime.timedelta(seconds=random.randint(0, int((endDate - startDate).total_seconds())))
		match.save()
		player_one.profile.matches.add(match)
		player_two.profile.matches.add(match)
		return match

	def addMatch(self, playerOne : Player, playerTwo : Player):
		match = self.create(player_one=playerOne.user, player_two=playerTwo.user)
		match.player_one_pts = playerOne.score if playerOne.socket else 0
		match.player_two_pts = playerTwo.score if playerTwo.user.username == "AI" or playerTwo.socket else 0
		match.date = datetime.datetime.now()
		match.winner = playerOne.user if playerOne.score > playerTwo.score or (playerTwo.user.username != "AI" and not playerTwo.socket) else playerTwo.user
		match.save()
		playerOne.user.profile.matches.add(match)
		playerTwo.user.profile.matches.add(match)

	def save(self):
		super().save()

class Match(models.Model):
	player_one = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="first_player")
	player_two = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="second_player")
	date = models.DateField(auto_now=False, auto_now_add=True)
	player_one_pts = models.IntegerField(default=0)
	player_two_pts = models.IntegerField(default=0)
	winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="winner")

	objects = MatchManager()

class TournamentModel(models.Model):
	date = models.DateField(auto_now=False, auto_now_add=True)
	matches = models.ManyToManyField(Match, related_name="matches")

	def __init__(self):
		super().__init__()
		self.date = datetime.datetime.now()
		self.save()

	def addMatchToTournament(self, game):
		self.matches.add(TournamentMatch(game))
		self.save()


class TournamentMatch(Match):
	round = models.IntegerField(default=0)
	match = models.IntegerField(default=0)

	def __init__(self, game):
		super().__init__()
		self.player_one = game.playerLeft.user
		self.player_two = game.playerRight.user
		self.player_one_pts = game.playerLeft.score
		self.player_two_pts = game.playerRight.score
		self.date = datetime.datetime.now()
		self.winner = game.winner.user
		self.round = game.round
		self.match = game.match
		self.save()
