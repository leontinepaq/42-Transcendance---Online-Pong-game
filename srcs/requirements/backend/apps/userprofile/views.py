import os
import logging
from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiTypes, OpenApiParameter
from users.models import UserProfile
from users.serializers import UserProfileSerializer, UserPublicProfileSerializer
from .serializers import (
    UpdateAvatarResponseSerializer,
    UpdateUsernameRequestSerializer,
    UpdateEmailRequestSerializer,
    UpdatePasswordRequestSerializer,
)
from users.serializers import GenericResponseSerializer, UserNotFoundErrorSerializer

User = get_user_model()

# DISPLAY PROFILE


@extend_schema(
    summary="display user's own profile",
    description="fetches user's own profile and returns its data",
    responses={
        404: UserNotFoundErrorSerializer,
        200: UserProfileSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_profile(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data, status=200)

# DISPLAY OTHER PROFILE


@extend_schema(
    summary="display another user's profile",
    description="fetches another user's profile based on provided user_id and returns its data",
    parameters=[OpenApiParameter(
        name="user_id",
        type=int,
        location=OpenApiParameter.QUERY,
        required=True)],
    responses={
        404: UserNotFoundErrorSerializer,
        200: UserProfileSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_other_profile(request):
    user_id = request.query_params.get("user_id")

    if not user_id or not user_id.isdigit():
        return Response({"details": "invalid or missing user id"}, status=400)

    user = get_object_or_404(UserProfile, id=int(user_id))
    serializer = UserPublicProfileSerializer(user)

    return Response(serializer.data, status=200)

# DISPLAY ALL PROFILES


@extend_schema(
    summary="display all users profiles",
    description="fetches all users profiles and returns its data",
    responses={
        200: UserProfileSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_all_profiles(request):
    users = UserProfile.objects.all()
    serializer = UserPublicProfileSerializer(users, many=True)
    return Response(serializer.data, status=200)

# UPDATE EMAIL


@extend_schema(
    summary="updates users's email",
    description="user updates email, checks if email is valid and not already in use",
    responses={
        400: GenericResponseSerializer,
        200: GenericResponseSerializer
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
            return GenericResponseSerializer({"details": "Invalid email format"}).response(400)

        if UserProfile.objects.filter(email=new_email).exclude(id=user.id).exists():
            return GenericResponseSerializer({"details": "Email already in use"}).response(400)

        user.email = new_email
        user.save()
        return GenericResponseSerializer({"details": "OK"}).response(200)
    return GenericResponseSerializer({"details": "Missing email field"}).response(400)


# UPDATE USERNAME

@extend_schema(
    summary="update username",
    description="user updates username, checks \
        if username is valid and not already in use",
    responses={
        400: GenericResponseSerializer,
        200: GenericResponseSerializer
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
            return GenericResponseSerializer({"details": "username already in use"}).response(400)

        if len(new_username) > 30:
            return GenericResponseSerializer({"details": "username too long"}).response(400)

        user.username = new_username
        user.save()
        return GenericResponseSerializer({"details": "OK"}).response(200)

    return GenericResponseSerializer({"details": "Missing username field"}).response(400)


# UPDATE PASSWORD

@extend_schema(
    summary="update password",
    description="user updates password, checks if password is \
        valid and if password and confirm password are the same",
    responses={
        400: GenericResponseSerializer,
        200: GenericResponseSerializer
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
        return GenericResponseSerializer({"details": "Both fields required"}).response(400)
    if new_password != confirm_password:
        return GenericResponseSerializer({"details": "Passwords do not match"}).response(400)

    user.set_password(new_password)
    user.save()
    return GenericResponseSerializer({"details": "OK"}).response(200)

# DEACTIVATE 2FA


@extend_schema(
    summary="deactivates 2fa",
    description="No specific parameters needed, the call of this endpoint sets all 2FA users parameters to false",
    responses={
        400: GenericResponseSerializer,
        200: GenericResponseSerializer
    },
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def deactivate_2FA(request):
    user = request.user

    user.is_two_factor_active = False
    user.is_two_factor_mail = False
    user.is_two_factor_auth = False

    user.save()
    return GenericResponseSerializer({"details": "OK"}).response(200)


# UPDATE AVATAR

@extend_schema(
    summary="update avatar",
    description="user uploads new avatar, saves it to media/avatars",
    responses={
        400: GenericResponseSerializer,
        200: UpdateAvatarResponseSerializer
    },
    request={
        "multipart/form-data": {
            "type": "object",
            "properties": {
                "avatar": {"type": "string",
                           "format": "binary"}
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
        return GenericResponseSerializer({"details": "No file uploaded"}).response(400)

    avatar = request.FILES["avatar"]
    allowed_types = ["image/jpeg",
                     "image/png"]
    if avatar.content_type not in allowed_types:
        return GenericResponseSerializer({"details": "Invalid file type"}).response(400)

    max_size = 10 * 1024 * 1024  # 10MB
    if avatar.size > max_size:
        return GenericResponseSerializer({"details": "File too large (Max 10MB)"}).response(400)

    avatar_dir = os.path.join(settings.MEDIA_ROOT, "avatars/")
    os.makedirs(avatar_dir, exist_ok=True)
    avatar_path = os.path.join(avatar_dir, f"user_{user.id}.jpg")

    try:
        # Open the files at avatar_path for writing in binary (wb)
        with default_storage.open(avatar_path, "wb") as destination:
            for chunk in avatar.chunks():
                destination.write(chunk)
    except Exception as e:
        print("Error saving file:", str(e))
        return GenericResponseSerializer({"details": "Error saving file"}).response(400)

    user.avatar_url = f"{settings.MEDIA_URL}avatars/user_{user.id}.jpg"
    user.save()

    return UpdateAvatarResponseSerializer({"details": "Avatar updated",
                                           "avatar_url": user.avatar_url}).response(200)
