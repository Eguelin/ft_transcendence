# Generated by Django 5.0.6 on 2024-07-11 12:39

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import login.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Match",
            fields=[
                ('player_one', models.ForeignKey(on_delete=models.SET_NULL, null=True, related_name="first_player", to=settings.AUTH_USER_MODEL)),
	            ('player_two', models.ForeignKey(on_delete=models.SET_NULL, null=True, related_name="second_player", to=settings.AUTH_USER_MODEL)),
	            ('date', models.DateField(auto_now=False, auto_now_add=True)),
	            ('player_one_pts', models.IntegerField(default=0)),
	            ('player_two_pts', models.IntegerField(default=0)),
            ]
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('id42', models.IntegerField(default=0)),
                ('dark_theme', models.BooleanField(default=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('profile_picture', models.TextField(default='profilePictures/defaults/default0.jpg')),
                ('language_pack', models.CharField(max_length=40, default="lang/EN_US.json")),
                ('display_name', models.CharField(max_length=15)),
            	('friend_code', models.CharField(max_length=20, null=True)),
                ('friends', models.ManyToManyField(related_name='friends_list', to=settings.AUTH_USER_MODEL)),
                ('friends_request', models.ManyToManyField(related_name='friends_request_list', to=settings.AUTH_USER_MODEL)),
                ('is_active', models.BooleanField(default=False)),
                ('blocked_users', models.ManyToManyField(related_name='block_users_list', to=settings.AUTH_USER_MODEL)),
            	('matches', models.ManyToManyField(related_name="matches_history", to='login.Match')),
            ],
        ),
    ]
