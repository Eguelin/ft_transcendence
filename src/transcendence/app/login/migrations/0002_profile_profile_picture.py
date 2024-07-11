# Generated by Django 5.0.6 on 2024-07-11 22:23

import login.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='profile_picture',
            field=models.FileField(default='default_pfp.jpg', upload_to=login.models.get_image_path),
        ),
    ]
