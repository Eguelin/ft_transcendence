from django.db import models
from django.contrib.auth.models import User
from login.views import create_deleted_user
import datetime
import random

class MatchManager(models.Manager):
	def createWithRandomOpps(self, creator):
		startDate = datetime.datetime(datetime.datetime.now().year,1,1)
		endDate = datetime.datetime(datetime.datetime.now().year,12,31)

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
			player_one = User.objects.create_user(username=userOne, password="password")
			player_one.save()

		try:
			player_two = User.objects.get(username=userTwo)
		except:
			player_two = User.objects.create_user(username=userTwo, password="password")
			player_two.save()

		p1 = random.randint(0,10)
		p2 = random.randint(0,10)
		me = random.randint(2,4)
		match = self.create(
			player_one=player_one,
			player_two=player_two,
			player_one_pts = p1,
			player_two_pts = p2,
			winner = player_one if p1 > p2 else player_two,
			player_one_goals_up= random.randint(0, 3),
			player_two_goals_up= random.randint(0, 3),
			player_one_goals_mid= random.randint(0, 3),
			player_two_goals_mid= random.randint(0, 3),
			player_one_goals_down= random.randint(0, 3),
			player_two_goals_down= random.randint(0, 3),
			exchangesMax = me,
			exchanges = random.randint(me, 10),
			)
		match.date = startDate + datetime.timedelta(seconds=random.randint(0, int((endDate - startDate).total_seconds())))
		match.save()
		player_one.profile.matches.add(match)
		player_two.profile.matches.add(match)

		return match

	def addMatch(self, game):
		match = self.create(
			player_one=game.playerLeft.user,
			player_two=game.playerRight.user,
			player_one_pts=game.playerLeft.score,
			player_two_pts=game.playerRight.score,
			date=datetime.datetime.now(),
			winner=game.winner.user,
			exchanges=game.exchanges,
			exchangesMax=game.exchangesMax,
			player_one_goals_up=game.playerLeft.goalsUp,
			player_two_goals_up=game.playerRight.goalsUp,
			player_one_goals_mid=game.playerLeft.goalsMid,
			player_two_goals_mid=game.playerRight.goalsMid,
			player_one_goals_down=game.playerLeft.goalsDown,
			player_two_goals_down=game.playerRight.goalsDown
		)

		game.playerLeft.user.profile.matches.add(match)
		game.playerRight.user.profile.matches.add(match)

	def save(self):
		super().save()

class Match(models.Model):
	player_one = models.ForeignKey(
		User,
		on_delete=models.SET(create_deleted_user),
		related_name="first_player"
	)
	player_two = models.ForeignKey(
		User,
		on_delete=models.SET(create_deleted_user),
		related_name="second_player"
	)
	date = models.DateField(auto_now=False, auto_now_add=True)
	player_one_pts = models.IntegerField(default=0)
	player_two_pts = models.IntegerField(default=0)
	winner = models.ForeignKey(
		User,
		on_delete=models.SET(create_deleted_user),
		related_name="matches_won"
	)
	exchanges = models.IntegerField(default=0)
	exchangesMax = models.IntegerField(default=0)
	player_one_goals_up = models.IntegerField(default=0)
	player_two_goals_up = models.IntegerField(default=0)
	player_one_goals_mid = models.IntegerField(default=0)
	player_two_goals_mid = models.IntegerField(default=0)
	player_one_goals_down = models.IntegerField(default=0)
	player_two_goals_down = models.IntegerField(default=0)

	objects = MatchManager()


class TournamentMatch(Match):
	round = models.IntegerField(default=0)
	match = models.IntegerField(default=0)
	winnerSide = models.CharField(max_length=10, default="None")

	def createMatchFromGame(self, game):
		match = self.objects.create(
			player_one=game.playerLeft.user,
			player_two=game.playerRight.user,
			player_one_pts=game.playerLeft.score,
			player_two_pts=game.playerRight.score,
			date=datetime.datetime.now(),
			winner=game.winner.user,
			winnerSide=game.winnerSide,
			exchanges=game.exchanges,
			exchangesMax=game.exchangesMax,
			player_one_goals_up=game.playerLeft.goalsUp,
			player_two_goals_up=game.playerRight.goalsUp,
			player_one_goals_mid=game.playerLeft.goalsMid,
			player_two_goals_mid=game.playerRight.goalsMid,
			player_one_goals_down=game.playerLeft.goalsDown,
			player_two_goals_down=game.playerRight.goalsDown,
			round=game.round,
			match=game.match
		)
		match.save()
		return match

class TournamentModel(models.Model):
	date = models.DateField(auto_now=False, auto_now_add=True)
	matches = models.ManyToManyField(TournamentMatch, related_name="matches")
	winner = models.ForeignKey(
		User,
		on_delete=models.SET(create_deleted_user),
		related_name="tournaments_won"
	)

	def addMatchToTournament(self, game):
		self.matches.add(TournamentMatch.createMatchFromGame(TournamentMatch, game))
		self.save()

