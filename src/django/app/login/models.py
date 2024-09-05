from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import random

# IF and WHEN fields are added 'python manage.py makemigrations' AND 'python manage.py migrate' must be executed in the transcendence container

class MatchManager(models.Manager):
	def createWithRandomOpps(self, creator):
		try:
			player_two = User.objects.get(username="random")
		except:
			player_two = User.objects.get_or_create(username="random")[0]
			player_two.save()
		match = self.create(player_one=creator, player_two=player_two)
		match.player_one_pts = random.randint(0, 10)
		match.player_two_pts = random.randint(0, 10)
		match.save()
		player_two.profile.matches.add(match)
		return match

	def save(self):
		super().save()

class Match(models.Model):
	player_one = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="first_player")
	player_two = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="second_player")
	date = models.DateField(auto_now=False, auto_now_add=True)
	player_one_pts = models.IntegerField(default=0)
	player_two_pts = models.IntegerField(default=0)

	objects = MatchManager()

class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	dark_theme = models.BooleanField(default=True)
	profile_picture = models.TextField(default="profilePictures/defaults/default0.jpg")
	language_pack = models.CharField(max_length=40, default="lang/EN_UK.json")
	friends = models.ManyToManyField(User, related_name="friends_list")
	friends_request = models.ManyToManyField(User, related_name="friends_request_list")
	is_active = models.BooleanField(default=False)
	blocked_users = models.ManyToManyField(User, related_name="block_user_list")
	id42 = models.IntegerField(default=0)
	matches = models.ManyToManyField(Match, related_name="matches_history")


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwards):
	if created:
		Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
	instance.profile.save()
