"""
Django settings for transcendence project.

Generated by 'django-admin startproject' using Django 5.1.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

import os

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG')

# 42 API credentials
PUBLIC = os.getenv('PUBLIC')
SECRET = os.getenv('SECRET')
REDIRECT_URI = os.getenv('REDIRECT_URI')

ALLOWED_HOSTS = [
    'localhost',
    '10.11.1.1',
    '10.11.1.2',
    '10.11.1.3',
    '10.11.1.4',
    '10.11.1.5',
    '10.11.2.1',
    '10.11.2.2',
    '10.11.2.3',
    '10.11.2.4',
    '10.11.2.5',
    '10.11.3.1',
    '10.11.3.2',
    '10.11.3.3',
    '10.11.3.4',
    '10.11.3.5',
    '10.11.4.1',
    '10.11.4.2',
    '10.11.4.3',
    '10.11.4.4',
    '10.11.4.5',
    '10.11.5.1',
    '10.11.5.2',
    '10.11.5.3',
    '10.11.5.4',
    '10.11.5.5',
    '10.11.6.1',
    '10.11.6.2',
    '10.11.6.3',
    '10.11.6.4',
    '10.11.6.5',
    '10.11.7.1',
    '10.11.7.2',
    '10.11.7.3',
    '10.11.7.4',
    '10.11.7.5',
    '10.11.8.1',
    '10.11.8.2',
    '10.11.8.3',
    '10.11.8.4',
    '10.11.8.5',
    '10.11.9.1',
    '10.11.9.2',
    '10.11.9.3',
    '10.11.9.4',
    '10.11.9.5',
    '10.11.10.1',
    '10.11.10.2',
    '10.11.10.3',
    '10.11.10.4',
    '10.11.10.5',
    '10.11.11.1',
    '10.11.11.2',
    '10.11.11.3',
    '10.11.11.4',
    '10.11.11.5',
    '10.11.12.1',
    '10.11.12.2',
    '10.11.12.3',
    '10.11.12.4',
    '10.11.12.5',
    '10.12.1.1',
    '10.12.1.2',
    '10.12.1.3',
    '10.12.1.4',
    '10.12.1.5',
    '10.12.1.6',
    '10.12.1.7',
    '10.12.1.8',
    '10.12.2.1',
    '10.12.2.2',
    '10.12.2.3',
    '10.12.2.4',
    '10.12.2.5',
    '10.12.2.6',
    '10.12.2.7',
    '10.12.2.8',
    '10.12.3.1',
    '10.12.3.2',
    '10.12.3.3',
    '10.12.3.4',
    '10.12.3.5',
    '10.12.3.6',
    '10.12.3.7',
    '10.12.3.8',
    '10.12.4.1',
    '10.12.4.2',
    '10.12.4.3',
    '10.12.4.4',
    '10.12.4.5',
    '10.12.4.6',
    '10.12.4.7',
    '10.12.4.8',
    '10.12.5.1',
    '10.12.5.2',
    '10.12.5.3',
    '10.12.5.4',
    '10.12.5.5',
    '10.12.5.6',
    '10.12.5.7',
    '10.12.5.8',
    '10.12.6.1',
    '10.12.6.2',
    '10.12.6.3',
    '10.12.6.4',
    '10.12.6.5',
    '10.12.6.6',
    '10.12.6.7',
    '10.12.6.8',
    '10.12.7.1',
    '10.12.7.2',
    '10.12.7.3',
    '10.12.7.4',
    '10.12.7.5',
    '10.12.7.6',
    '10.12.7.7',
    '10.12.7.8',
    '10.12.8.1',
    '10.12.8.2',
    '10.12.8.3',
    '10.12.8.4',
    '10.12.8.5',
    '10.12.8.6',
    '10.12.8.7',
    '10.12.8.8',
    '10.12.9.1',
    '10.12.9.2',
    '10.12.9.3',
    '10.12.9.4',
    '10.12.9.5',
    '10.12.9.6',
    '10.12.9.7',
    '10.12.9.8',
    '10.12.10.1',
    '10.12.10.2',
    '10.12.10.3',
    '10.12.10.4',
    '10.12.10.5',
    '10.12.10.6',
    '10.12.10.7',
    '10.12.10.8',
    '10.12.11.1',
    '10.12.11.2',
    '10.12.11.3',
    '10.12.11.4',
    '10.12.11.5',
    '10.12.11.6',
    '10.12.11.7',
    '10.12.11.8',
    '10.12.12.1',
    '10.12.12.2',
    '10.12.12.3',
    '10.12.12.4',
    '10.12.12.5',
    '10.12.12.6',
    '10.12.12.7',
    '10.12.12.8',
    '10.13.1.1',
    '10.13.1.2',
    '10.13.1.3',
    '10.13.1.4',
    '10.13.1.5',
    '10.13.1.6',
    '10.13.2.1',
    '10.13.2.2',
    '10.13.2.3',
    '10.13.2.4',
    '10.13.2.5',
    '10.13.2.6',
    '10.13.3.1',
    '10.13.3.2',
    '10.13.3.3',
    '10.13.3.4',
    '10.13.3.5',
    '10.13.3.6',
    '10.13.4.1',
    '10.13.4.2',
    '10.13.4.3',
    '10.13.4.4',
    '10.13.4.5',
    '10.13.4.6',
    '10.13.5.1',
    '10.13.5.2',
    '10.13.5.3',
    '10.13.5.4',
    '10.13.5.5',
    '10.13.5.6',
    '10.13.6.1',
    '10.13.6.2',
    '10.13.6.3',
    '10.13.6.4',
    '10.13.6.5',
    '10.13.6.6',
    '10.13.7.1',
    '10.13.7.2',
    '10.13.7.3',
    '10.13.7.4',
    '10.13.7.5',
    '10.13.7.6',
    '10.13.8.1',
    '10.13.8.2',
    '10.13.8.3',
    '10.13.8.4',
    '10.13.8.5',
    '10.13.8.6',
    '10.13.9.1',
    '10.13.9.2',
    '10.13.9.3',
    '10.13.9.4',
    '10.13.9.5',
    '10.13.9.6',
    '10.13.10.1',
    '10.13.10.2',
    '10.13.10.3',
    '10.13.10.4',
    '10.13.10.5',
    '10.13.10.6',
    '10.13.11.1',
    '10.13.11.2',
    '10.13.11.3',
    '10.13.11.4',
    '10.13.11.5',
    '10.13.11.6',
    '10.13.12.1',
    '10.13.12.2',
    '10.13.12.3',
    '10.13.12.4',
    '10.13.12.5',
    '10.13.12.6',
    '10.13.13.1',
    '10.13.13.2',
    '10.13.13.3',
    '10.13.13.4',
    '10.13.13.5',
    '10.13.13.6',
    '10.14.1.1',
    '10.14.1.2',
    '10.14.1.3',
    '10.14.1.4',
    '10.14.1.5',
    '10.14.1.6',
    '10.14.1.7',
    '10.14.2.1',
    '10.14.2.2',
    '10.14.2.3',
    '10.14.2.4',
    '10.14.2.5',
    '10.14.2.6',
    '10.14.2.7',
    '10.14.3.1',
    '10.14.3.2',
    '10.14.3.3',
    '10.14.3.4',
    '10.14.3.5',
    '10.14.3.6',
    '10.14.3.7',
    '10.14.4.1',
    '10.14.4.2',
    '10.14.4.3',
    '10.14.4.4',
    '10.14.4.5',
    '10.14.4.6',
    '10.14.4.7',
    '10.14.5.1',
    '10.14.5.2',
    '10.14.5.3',
    '10.14.5.4',
    '10.14.5.5',
    '10.14.5.6',
    '10.14.5.7',
    '10.14.6.1',
    '10.14.6.2',
    '10.14.6.3',
    '10.14.6.4',
    '10.14.6.5',
    '10.14.6.6',
    '10.14.6.7',
    '10.14.7.1',
    '10.14.7.2',
    '10.14.7.3',
    '10.14.7.4',
    '10.14.7.5',
    '10.14.7.6',
    '10.14.7.7',
    '10.14.8.1',
    '10.14.8.2',
    '10.14.8.3',
    '10.14.8.4',
    '10.14.8.5',
    '10.14.8.6',
    '10.14.8.7',
    '10.14.9.1',
    '10.14.9.2',
    '10.14.9.3',
    '10.14.9.4',
    '10.14.9.5',
    '10.14.9.6',
    '10.14.9.7',
    '10.14.10.1',
    '10.14.10.2',
    '10.14.10.3',
    '10.14.10.4',
    '10.14.10.5',
    '10.14.10.6',
    '10.14.10.7',
    '10.14.11.1',
    '10.14.11.2',
    '10.14.11.3',
    '10.14.11.4',
    '10.14.11.5',
    '10.14.11.6',
    '10.14.11.7',
    '10.14.12.1',
    '10.14.12.2',
    '10.14.12.3',
    '10.14.12.4',
    '10.14.12.5',
    '10.14.12.6',
    '10.14.12.7',
    '10.14.13.1',
    '10.14.13.2',
    '10.14.13.3',
    '10.14.13.4',
    '10.14.13.5',
    '10.14.13.6',
    '10.14.13.7',
]

# Application definition

INSTALLED_APPS = [
    'daphne',
    'channels',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'login',
    'game',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'transcendence.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'transcendence.wsgi.application'

ASGI_APPLICATION = 'transcendence.asgi.application'

# Channels
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('redis', 6379)],
        },
    },
}

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL')
    )
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760 # 10MB
