# from django.contrib.auth import get_user_model, authenticate
# from django.core.validators import validate_email
# from rest_framework.response import Response
# from rest_framework.request import Request
# from rest_framework.decorators import api_view, permission_classes, parser_classes
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.exceptions import ValidationError
# from django.contrib.auth.tokens import default_token_generator
# from django.contrib.sites.shortcuts import get_current_site
# from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
# from django.template.loader import render_to_string
# from django.core.mail import send_mail
# from django.conf import settings
# from rest_framework import status
# from django.utils.crypto import get_random_string
# from django.utils.dateparse import parse_datetime
# import string
# from django.utils import timezone
# from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
# import os
# import logging
# from datetime import timedelta, datetime
# from io import BytesIO
# import pyotp
# import qrcode
# import base64
# import time
# from dashboards.models import UserStatistics, Game
# from users.serializers.auth import (GenericResponseSerializer, UserNotFoundErrorSerializer,)
# from .serializers import UpdateAvatarResponseSerializer, UpdateUsernameRequestSerializer, Update2FARequestSerializer, UpdateEmailRequestSerializer, UpdatePasswordRequestSerializer
# from users.serializers.users import UserProfileSerializer
# from users.models import UserProfile

import os
import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiTypes
from users.models import UserProfile
from users.serializers.users import UserProfileSerializer
from .serializers import (
    UpdateAvatarResponseSerializer,
    UpdateUsernameRequestSerializer,
    Update2FARequestSerializer,
    UpdateEmailRequestSerializer,
    UpdatePasswordRequestSerializer,
)
from users.serializers.auth import GenericResponseSerializer, UserNotFoundErrorSerializer



logger = logging.getLogger(__name__)
User=get_user_model()


@extend_schema(
    summary="display profiles",
    description="fetches user profile and returns its data",
    responses={
        404:UserNotFoundErrorSerializer,
        200:GenericResponseSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_profile(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)

@extend_schema(
    summary="update email",
    description="user updates email, checks if email is valid and not already in use",
    responses={
        400:GenericResponseSerializer,
        200:GenericResponseSerializer
    },
    request=UpdateEmailRequestSerializer
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_email(request):
    user = request.user

    new_email = request.data.get("new_email")
    if new_email:
        try:
            validate_email(new_email)
        except ValidationError:
            return GenericResponseSerializer({"message": "Invalid email format"}).response(400)

        if UserProfile.objects.filter(email=new_email).exclude(id=user.id).exists():
            return GenericResponseSerializer({"message": "Email already in use"}).response(400)

        user.email = new_email
        user.save()
        return GenericResponseSerializer({"message": "OK"}).response(200)
    return GenericResponseSerializer({"message": "Missing email field"}).response(400)

@extend_schema(
    summary="update username",
    description="user updates username, checks if username is valid and not already in use",
    responses={
        400:GenericResponseSerializer,
        200:GenericResponseSerializer
    },
    request=UpdateUsernameRequestSerializer,
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_username(request):
    user = request.user

    new_username = request.data.get("new_username")
    if new_username:
        if UserProfile.objects.filter(username=new_username).exclude(id=user.id).exists():
            return GenericResponseSerializer({"message": "username already in use"}).response(400)

        if len(new_username) > 30:
            return GenericResponseSerializer({"message": "username too long"}).response(400)

        user.username = new_username
        user.save()
        return GenericResponseSerializer({"message": "OK"}).response(200)

    return GenericResponseSerializer({"message": "Missing username field"}).response(400)

@extend_schema(
    summary="update password",
    description="user updates password, checks if password is valid",
    responses={
        400:GenericResponseSerializer,
        200:GenericResponseSerializer
    },
    request=UpdatePasswordRequestSerializer
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_password(request):
    user = request.user

    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not new_password or not confirm_password:
        return GenericResponseSerializer({"message": "Both fields required"}).response(400)
    if new_password != confirm_password:
        return GenericResponseSerializer({"message": "Passwords do not match"}).response(400)

    user.set_password(new_password)
    user.save()
    return GenericResponseSerializer({"message": "OK"}).response(200)

@extend_schema(
    summary="update 2fa",
    description="user activates or deactivates 2fa, then choose method if he activates it",
    responses={
        400:GenericResponseSerializer,
        200:GenericResponseSerializer
    },
    request=Update2FARequestSerializer
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_2FA(request):
    user = request.user

    new_activate_2fa = request.data.get("new_activate_2fa")
    new_activate_2fa_mail = request.data.get("new_activate_2fa_mail")
    new_activate_2fa_auth = request.data.get("new_activate_2fa_auth")

    if new_activate_2fa:
        if new_activate_2fa_mail and new_activate_2fa_auth:
            return GenericResponseSerializer({"message": "Choose only one 2FA method"}).response(400)

        user.is_two_factor_active = True
        user.is_two_factor_mail = bool(new_activate_2fa_mail)
        user.is_two_factor_auth = bool(new_activate_2fa_auth)
    else:
        user.is_two_factor_active = False
        user.is_two_factor_mail = False
        user.is_two_factor_auth = False

    user.save()
    return GenericResponseSerializer({"message": "OK"}).response(200)

@extend_schema(
    summary="update avatar",
    description="user uploads new avatar, saves it to media/avatars",
    responses={
        400:GenericResponseSerializer,
        200:UpdateAvatarResponseSerializer
    },
    request={
        "multipart/form-data": {
            "type": "object",
            "properties": {
                "avatar": {"type": "string", "format": "binary"}
            },
            "required": ["avatar"]
        }
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_avatar(request):
    user = request.user

    if "avatar" not in request.FILES:
        return GenericResponseSerializer({"message": "No file uploaded"}).response(400)

    avatar = request.FILES["avatar"]
    allowed_types = ["image/jpeg", "image/png"]
    if avatar.content_type not in allowed_types:
        return GenericResponseSerializer({"message": "Invalid file type"}).response(400)

    max_size = 10 * 1024 * 1024 #10MB
    if avatar.size > max_size:
        return GenericResponseSerializer({"message": "File too large (Max 10MB)"}).response(400)

    avatar_dir = os.path.join(settings.MEDIA_ROOT, "avatars/")
    os.makedirs(avatar_dir, exist_ok=True)
    avatar_path = os.path.join(avatar_dir, f"user_{user.id}.jpg")

    try:
    #Open the files at avatar_path for writing in binary (wb)
        with default_storage.open(avatar_path, "wb") as destination:
            for chunk in avatar.chunks():
                destination.write(chunk)
    except Exception as e:
        print("Error saving file:", str(e))
        return GenericResponseSerializer({"message": "Error saving file"}).response(400)

    user.avatar_url = f"{settings.MEDIA_URL}avatars/user_{user.id}.jpg"
    user.save()

    return UpdateAvatarResponseSerializer({"message": "Avatar updated", "avatar_url": user.avatar_url}).response(200)
