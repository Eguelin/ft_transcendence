# Generated by Django 5.1.3 on 2024-12-02 14:30

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('game', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('display_name', models.CharField(default='Player', max_length=15)),
                ('theme_name', models.CharField(default='dark', max_length=10)),
                ('profile_picture', models.TextField(default='/images/defaults/default0.jpg')),
                ('language_pack', models.CharField(default='EN_UK', max_length=5)),
                ('is_active', models.BooleanField(default=False)),
                ('id42', models.IntegerField(default=0)),
                ('font_amplifier', models.FloatField(default=1, validators=[django.core.validators.MinValueValidator(0.1), django.core.validators.MaxValueValidator(2.0)])),
                ('do_not_disturb', models.BooleanField(default=False)),
                ('blocked_users', models.ManyToManyField(related_name='block_user_list', to=settings.AUTH_USER_MODEL)),
                ('friends', models.ManyToManyField(related_name='friends_list', to=settings.AUTH_USER_MODEL)),
                ('friends_request', models.ManyToManyField(related_name='friends_request_list', to=settings.AUTH_USER_MODEL)),
                ('matches', models.ManyToManyField(related_name='matches_history', to='game.match')),
                ('tournaments', models.ManyToManyField(related_name='tournaments', to='game.tournamentmodel')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
