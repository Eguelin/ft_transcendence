# Generated by Django 5.1.3 on 2024-11-25 13:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='language_pack',
            field=models.CharField(default='lang/EN_UK.json', max_length=40),
        ),
    ]