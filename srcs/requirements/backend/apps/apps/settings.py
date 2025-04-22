import os
from pathlib import Path
from datetime import timedelta

DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["0.0.0.0",
                 "127.0.0.1",
                 "localhost",
                 "made-f0ar1s7"]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Application definition

INSTALLED_APPS = ['daphne',
                  'channels',
                  'django.contrib.admin',
                  'django.contrib.auth',
                  'django.contrib.contenttypes',
                  'django.contrib.sessions',
                  'django.contrib.messages',
                  'django.contrib.staticfiles',

                  'drf_spectacular',

                  'rest_framework',
                  'rest_framework_simplejwt',

                  'users',
                  'userprofile',
                  'dashboards',
                  'friendship',
				  'tournament',
                  'pong']

# Use Daphne as the ASGI application
ASGI_APPLICATION = "apps.asgi.application"

# Define channel layers (using in-memory for now, use Redis for production)
CHANNEL_LAYERS = {
    "default": {"BACKEND": "channels_redis.core.RedisChannelLayer",
                "CONFIG": {"hosts": [("redis", 6379)], }, },
}

REST_FRAMEWORK = {'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication',],
                  'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
                  'DEFAULT_PARSER_CLASSES': ['rest_framework.parsers.JSONParser',
                                             'rest_framework.parsers.MultiPartParser',]}

# TO CHANGE AFTER DEVELOPMENT ACCES TOKEN LIFETIME SHOULD BE MINUTE=15
SIMPLE_JWT = {"SIGNING_KEY": SECRET_KEY,
              "ALGORITHM": "HS256",  # Ensure this is properly set
              "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
              "REFRESH_TOKEN_LIFETIME": timedelta(hours=7),
              "ROTATE_REFRESH_TOKENS": True,
              "BLACKLIST_AFTER_ROTATION": True,
              "AUTH_HEADER_TYPES": ("Bearer",),
              "AUTH_COOKIE": "access_token",
              "REFRESH_COOKIE": "refresh_token",
              "AUTH_COOKIE_HTTP_ONLY": True,
              "AUTH_COOKIE_SECURE": not DEBUG,
              "AUTH_COOKIE_SAMESITE": "Strict",}

CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_WHITELIST = ['https://localhost:8888',
                         'http://localhost:9999']
CORS_ALLOWED_ORIGINS = ["https://localhost:8888",
                        "http://localhost:9999"]
CSRF_TRUSTED_ORIGINS = ["https://localhost:8888",
                        "http://localhost:9999"]
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

MIDDLEWARE = ['django.middleware.security.SecurityMiddleware',
              'django.contrib.sessions.middleware.SessionMiddleware',
              'django.middleware.common.CommonMiddleware',
              'django.middleware.csrf.CsrfViewMiddleware',
              'django.contrib.auth.middleware.AuthenticationMiddleware',
              'django.contrib.messages.middleware.MessageMiddleware',
              'django.middleware.clickjacking.XFrameOptionsMiddleware',
              'django_otp.middleware.OTPMiddleware']

ROOT_URLCONF = 'apps.urls'

TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates',
              'DIRS': [os.path.join(BASE_DIR, 'templates')],
              'APP_DIRS': True,
              'OPTIONS': {'context_processors': ['django.template.context_processors.debug',
                                                 'django.template.context_processors.request',
                                                 'django.contrib.auth.context_processors.auth',
                                                 'django.contrib.messages.context_processors.messages',],},
              },]

WSGI_APPLICATION = 'apps.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {"default": {'ENGINE': 'django.db.backends.postgresql',
                         'NAME': os.environ.get("POSTGRES_DB"),
                         'USER': os.environ.get("POSTGRES_USER"),
                         'PASSWORD': os.environ.get("POSTGRES_PASSWORD"),
                         'HOST': 'postgres',
                         'PORT': 5432,}}

AUTH_USER_MODEL = 'users.UserProfile'

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [{'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
                            {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
                            {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
                            {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_TZ = True
USE_I18N = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email configuration for development (use an actual SMTP server in production)
# This prints the email to the console
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'                # or your provider
EMAIL_PORT = 587                             # TLS port
EMAIL_USE_TLS = True                         # Use TLS (secure)
EMAIL_HOST_USER = os.environ.get("EMAIL_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_PASS")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER


MEDIA_ROOT = "/media/"
DEFAULT_AVATAR_URL = "/media/avatars/default_avatar.png"
AI_AVATAR_URL = "/media/avatars/ai_avatar.png"