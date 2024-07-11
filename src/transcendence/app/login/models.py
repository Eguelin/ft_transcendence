from django.db import models


from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver



def get_image_path(instance, filename):
	return ("user/{0}/{1}".format(instance.user.id, filename))

# IF and WHEN fields are added 'python manage.py makemigrations' AND 'python manage.py migrate' must be executed in the transcendence container
class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	dark_theme = models.BooleanField(default=True)
	profile_picture = models.FileField(upload_to=get_image_path, default="default_pfp.jpg")
	
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwards):
	if created:
		Profile.objects.create(user=instance)
		
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
	instance.profile.save()