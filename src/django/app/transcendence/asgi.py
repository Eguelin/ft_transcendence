"""
ASGI config for transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import django

if os.environ.get('DJANGO_DEBUG') != 'True':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "transcendence.settings")
    django.setup()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from django.urls import path
from game.game import GameConsumer
from friendship.consumers import friend

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter([
                path("game/", GameConsumer.as_asgi()),
                path("friend/", friend.as_asgi()),
            ])
        )
    ),
})
