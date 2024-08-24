"""
URL configuration for transcendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from login import views as login_view
from friendship import views as friendship_view

urlpatterns = [
    path('user/create', login_view.create_user),
    path('user/login', login_view.user_login),
    path('user/logout', login_view.user_logout),
    path('user/current', login_view.current_user),
	path('user/fortyTwo/login', login_view.fortytwo),
    path('user/update', login_view.profile_update),
    path('user/send_friend_request', friendship_view.send_friend_request),
    path('user/accept_friend_request', friendship_view.accept_friend_request),
    path('user/reject_friend_request', friendship_view.reject_friend_request),
    path('user/remove_friend', friendship_view.remove_friend),
    path('user/block_friend', friendship_view.block_friend),
    path('user/unblock_user', friendship_view.unblock_user),
]
