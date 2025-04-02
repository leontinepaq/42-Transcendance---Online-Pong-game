from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.crypto import get_random_string
import string
from django.utils import timezone
from datetime import timedelta, datetime
from django.core.mail import send_mail
from django.conf import settings
import pyotp

class UserProfileManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError("Username is required")
        if not password:
            raise ValueError("Password mandatory")
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(username, email, password, **extra_fields)

class UserProfile(AbstractBaseUser, PermissionsMixin):
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email",
                       "password"]

    id =                    models.AutoField(primary_key=True)
    username =              models.CharField(max_length=30, unique=True)
    email =                 models.EmailField(unique=True)
    avatar_url =            models.CharField(blank=False, null=False,
                                             default=settings.DEFAULT_AVATAR_URL)
    created_at =            models.DateTimeField(auto_now_add=True)
    is_active =             models.BooleanField(default=True)
    is_connected =          models.BooleanField(default=False)
    is_mail_activated =     models.BooleanField(default=False)
    is_staff =              models.BooleanField(default=False)
    is_two_factor_mail =    models.BooleanField(default=False)
    is_two_factor_auth =    models.BooleanField(default=False)
    two_factor_code =       models.CharField(max_length=6, blank=True, null=True)
    two_factor_expiry =     models.DateTimeField(blank=True, null=True, default=None)
    totp_secret =           models.CharField(max_length=32, blank=True, null=True)
    friends =               models.ManyToManyField("self", blank=True)
    blocked =               models.ManyToManyField("self", blank=True, symmetrical=False)
    objects =               UserProfileManager()
    theme =                 models.CharField(max_length=5,
                                             choices=[("light", "Light"), ("dark", "Dark")],
                                             default="light")

    def is_mail_code_valid(self, code):
        return (self.two_factor_code == code
            and self.two_factor_expiry
            and self.two_factor_expiry > timezone.now())
    
    def is_auth_code_valid(self, code):
        return pyotp.TOTP(self.totp_secret).verify(code, valid_window = 1)
        
    def reset_2fa_code(self):
        self.two_factor_code = None
        self.two_factor_expiry = None
        self.save()
        
    def send_2fa_mail(self):
        # if not self.is_two_factor_mail:
        #     return
        self.two_factor_code = get_random_string(length=6,
                                                 allowed_chars=string.digits)
        self.two_factor_expiry = timezone.now() + timedelta(minutes=15)
        self.save()
        send_mail(
            'Your 2FA Code',
            f'Your 2FA code is: {self.two_factor_code}',
            settings.DEFAULT_FROM_EMAIL,
            [self.email],
            fail_silently=False,
        )
        
    @staticmethod
    def get_unknown_user():
        """Retrieve or create a default 'Unknown' user."""
        user, created = UserProfile.objects.get_or_create(
            username="Unknown",
            defaults={"email": None, "is_active": False}
        )
        return user

    @staticmethod
    def get_ai_user():
        """Retrieve or create a default AI user."""
        user, created = UserProfile.objects.get_or_create(
            username="AI",
            defaults={"email": None, "is_active": False}
        )
        return user

    def __str__(self):
        return self.username

