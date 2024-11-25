from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .views import create_default_users

@receiver(post_migrate)
def call_create_default_users(sender, **kwargs):
    create_default_users()
