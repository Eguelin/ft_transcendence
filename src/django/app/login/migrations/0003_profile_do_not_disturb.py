# Generated by Django 5.1.2 on 2024-10-28 10:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0002_profile_theme_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='do_not_disturb',
            field=models.BooleanField(default=False),
        ),
    ]
