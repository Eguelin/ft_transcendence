# Generated by Django 5.1.3 on 2024-11-11 17:43

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(auto_now_add=True)),
                ('player_one_pts', models.IntegerField(default=0)),
                ('player_two_pts', models.IntegerField(default=0)),
                ('player_one', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='first_player', to=settings.AUTH_USER_MODEL)),
                ('player_two', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='second_player', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='winner', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentMatch',
            fields=[
                ('match_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='game.match')),
                ('round', models.IntegerField(default=0)),
                ('match', models.IntegerField(default=0)),
            ],
            bases=('game.match',),
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(auto_now_add=True)),
                ('matches', models.ManyToManyField(related_name='matches', to='game.match')),
                ('players', models.ManyToManyField(related_name='players', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
