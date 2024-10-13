"""
URL configuration for transcendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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
import login.views, friendship.views, admin.views

urlpatterns = [
    path('user/create', login.views.create_user),
    path('admin/create', admin.views.create_user),
    path('admin/create_match', admin.views.create_match),
    path('admin/create_friendship', admin.views.create_friendship),
    path('user/getClientId', login.views.getClientId),
    path('user/login', login.views.user_login),
    path('user/logout', login.views.user_logout),
    path('user/current', login.views.current_user),
	path('user/fortyTwo/login', login.views.fortytwo),
    path('user/update', login.views.profile_update),
    path('user/send_friend_request', friendship.views.send_friend_request),
    path('user/accept_friend_request', friendship.views.accept_friend_request),
    path('user/reject_friend_request', friendship.views.reject_friend_request),
    path('user/remove_friend', friendship.views.remove_friend),
    path('user/block_friend', friendship.views.block_friend),
    path('user/unblock_user', friendship.views.unblock_user),
    path('user/get', login.views.get),
    path('user/search_by_username', login.views.search_by_username),
    path('user/delete_user', login.views.delete_user),
]
