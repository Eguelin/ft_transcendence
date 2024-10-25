from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from game.models import Match
from django.core.validators import MaxValueValidator, MinValueValidator

class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	use_browser_theme = models.BooleanField(default=True)
	dark_theme = models.BooleanField(default=True)
	profile_picture = models.TextField(default="/images/defaults/default0.jpg")
	language_pack = models.CharField(max_length=40, default="lang/EN_UK.json")
	friends = models.ManyToManyField(User, related_name="friends_list")
	friends_request = models.ManyToManyField(User, related_name="friends_request_list")
	is_active = models.BooleanField(default=False)
	blocked_users = models.ManyToManyField(User, related_name="block_user_list")
	id42 = models.IntegerField(default=0)
	matches = models.ManyToManyField(Match, related_name="matches_history")
	font_amplifier = models.FloatField(default=1, validators=[MinValueValidator(0.1), MaxValueValidator(2.0)],)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwards):
	if created:
		Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
	instance.profile.save()
