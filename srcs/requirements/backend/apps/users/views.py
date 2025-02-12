from django.contrib.auth import get_user_model, authenticate
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from django.utils.crypto import get_random_string
from django.utils.dateparse import parse_datetime
import string
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from .serializers import (GenericResponseSerializer,
                          InputLoginSerializer,
                          InputRegisterSerializer,
                          InputVerify2faSerializer,
                          LoginErrorSerializer,
                          LoginSuccessSerializer,
                          Verify2faErrorSerializer,
                          InputSend2faSerializer,
                          RegisterErrorSerializer,)
import logging
from datetime import timedelta, datetime
from io import BytesIO
import pyotp
import qrcode
import base64
import time
from dashboards.models import UserStatistics, Game

logger = logging.getLogger(__name__)
User=get_user_model()

@extend_schema(
    summary="Register",
    description="Expecting JSON",
    request=InputRegisterSerializer,
    responses={400: RegisterErrorSerializer,
               201: GenericResponseSerializer}
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email=request.data.get("email")
    username=request.data.get("username")
    password=request.data.get("password")
    username_exists=User.objects.filter(username=username).exists()
    email_exists=User.objects.filter(email=email).exists()
    
    if username_exists or email_exists:
        return RegisterErrorSerializer({"email": email_exists,
                                        "username": username_exists}).response(400)
    user=User.objects.create_user(email=email,
                                  username=username,
                                  password=password)
    return GenericResponseSerializer({"message": "OK"}).response(201)

@extend_schema(
    summary="Login",
    description="Expecting JSON",
    request=InputLoginSerializer,
    responses={404: LoginErrorSerializer,
               200: LoginSuccessSerializer}
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username=request.data.get("username")
    password=request.data.get("password")

    if User.objects.filter(username=username).exists() == False:
        return LoginErrorSerializer({"message": "User does not exist"}).response(404)
    user=authenticate(request, username=username, password=password)
    if user is None:
        return LoginErrorSerializer({"message": "Wrong password"}).response(404)
    if user.is_two_factor_active or user.is_two_factor_mail or user.is_two_factor_auth:
        return LoginSuccessSerializer({"two_factor_needed": True,
                                       "email": user.is_two_factor_mail,
                                       "qr": user.is_two_factor_auth}).response(200)

    return refreshToken(user)
    return response #??


@extend_schema(
    summary="Ask for 2f mail send",
    description="Expecting JSON",
    request=InputSend2faSerializer,
    responses={200: GenericResponseSerializer({"mesuserbsage": "Sent"}),
               404: LoginErrorSerializer({"message": "User does not exist"})}
)
@api_view(["POST"])
def send_2fa(request):
    username=request.data.get("username")
    if User.objects.filter(username=username).exists() == False:
        return LoginErrorSerializer({"message": "User does not exist"}).response(404)
    
    user=User.objects.get(username=username)
    user.two_factor_code=get_random_string(length=6,
                                             allowed_chars=string.digits)
    user.two_factor_expiry=timezone.now() + timedelta(minutes=15)
    user.save()    

    try:
        send_mail(
            'Your 2FA Code',
            f'Your 2FA code is: {user.two_factor_code}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return Response({'message': '2FA code sent'},
                        status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(
    summary="Verify 2FA code",
    description="Expecting JSON",
    request=InputVerify2faSerializer,
    responses={
        400:Verify2faErrorSerializer,
        404:UserNotFoundErrorSerializer,
        200:GenericResponseSerializer
    }
)
@api_view(["POST"])
def verify_2fa(request):
    code=request.data.get('code')
    username=request.data.get('username')
    user=User.objects.get(username=username)
    
    if code is None or user.two_factor_code != code:
        return Verify2faErrorSerializer({"invalid": True}).response(400)
    if user.two_factor_expiry < timezone.now():
        return Verify2faErrorSerializer({"expired": True}).response(400)
    if request.data.get("activate_mail"):
        user.is_mail_activated=True
    user.two_factor_expiry=None
    user.two_factor_code=None
    user.save()
    return refreshToken(user)

def refreshToken(user):
    print("TEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE")
    refresh=RefreshToken.for_user(user)
    response=Response({"message": "Login successful"})
    
    # Set JWT as HttpOnly Cookie
    response.set_cookie(key="access_token",
                        value=str(refresh.access_token),
                        httponly=True,
                        secure=True, # Enable this for HTTPS
                        samesite="Strict")
    
    response.set_cookie(key="refresh_token",
                        value=str(refresh),
                        httponly=True,
                        secure=True,
                        samesite="Strict")
    return response

@extend_schema(
    summary="Logout",
    description="Expecting nothing",
    responses={200: GenericResponseSerializer}
)
@permission_classes([IsAuthenticated])
@api_view(["POST"])
def logout(request):
    response=Response({"message": "Logged out"})
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response

@api_view(["GET"])
@extend_schema(
    summary="Logout",
    description="Expecting nothing",
    responses={200: GenericResponseSerializer({"authenticated": True,
                                               "username": ""})}
)
@permission_classes([IsAuthenticated])
def auth_check(request):
    return GenericResponseSerializer({"authenticated": True,
                                      "username": request.user.username}).response()

@extend_schema(
    summary='Activate authenticator 2fa',
    description="Generates TOTP secret and provides QR code",
    responses={
        200: ActivateAuthenticatorResponseSerializer,
    }
)
@api_view(["PUT"])    
@permission_classes([IsAuthenticated])
def activate_authenticator(request):
    user = request.user

    secret = pyotp.random_base32()
    user.totp_secret = secret
    user.is_two_factor_mail = False
    user.is_two_factor_auth = True
    user.save()
    
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=user.username, issuer_name="Transcendance")

    
    img = qrcode.make(uri)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    return Response({"qr_code": f"data:image/png;base64,{qr_base64}"}, status=status.HTTP_200_OK)
    
@extend_schema(
    summary="Verify authenticator code",
    description="Verify a TOTP authenticator code, Expecting JSON",
    responses={
        400:VerifyAuthenticatorErrorSerializer,
        403: GenericResponseSerializer({"message": "Invalid code, please try again"})
        404:UserNotFoundErrorSerializer,
        200:GenericResponseSerializer
    }
)
@api_view(["POST"])
def verify_authenticator(request):
    code = request.data.get('code')
    username = request.data.get('username')

    if not all([code, username]):
        return VerifyAuthenticatorErrorSerializer({"message": "code or username missing"}).response(400)

    user = User.objects.get(username=username)

    if not user.totp_secret:
        return VerifyAuthenticatorErrorSerializer({"message": "totp secret missing"}).response(400)
    
    totp = pyotp.TOTP(user.totp_secret)
    
    if totp.verify(code, valid_window=1):
        return refreshToken(user)

    return GenericResponseSerializer({"message": "Invalid code, please try again"}).response(403)


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
    }
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
            return GenericResponseSerializer({"message": "Invalid email format"}).Response(400)

        if UserProfile.objects.filter(email=new_email).exclude(id=user.id).exists():
            return GenericResponseSerializer({"message": "Email already in use"}).Response(400)

        user.email = new_email
        user.save()
        return GenericResponseSerializer().Response(200)
    return GenericResponseSerializer({"message": "Missing email field"}).Response(400)

@extend_schema(
    summary="update username",
    description="user updates username, checks if username is valid and not already in use",
    responses={
        400:GenericResponseSerializer,
        200:GenericResponseSerializer
    }
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_username(request):
    user = request.user

    new_username = request.data.get("new_username")
    if new_username:
        if UserProfile.objects.filter(username=new_username).exclude(id=user.id).exists():
            return GenericResponseSerializer({"message": "username already in use"}).Response(400)

        if len(new_username) > 30:
            return GenericResponseSerializer({"message": "username too long"}).Response(400)

        user.username = new_username
        user.save()
        return GenericResponseSerializer().Response(200)

    return GenericResponseSerializer({"message": "Missing username field"}).Response(400)

@extend_schema(
    summary="update password",
    description="user updates password, checks if password is valid",
    responses={
        400:GenericResponseSerializer,
        200:GenericResponseSerializer
    }
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_password(request):
    user = request.user

    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not new_password or not confirm_password:
        return GenericResponseSerializer({"message": "Both fields required"}).Response(400)
    if new_password != confirm_password:
        return GenericResponseSerializer({"message": "Passwords do not mtch"}).Response(400)

    user.set_password(new_password)
    user.save()
    return GenericResponseSerializer().Response(200)

@extend_schema(
    summary="update 2fa",
    description="user activates or deactivates 2fa, then choose method if he activates it",
    responses={
        400:GenericResponseSerializer,
        200:GenericResponseSerializer
    }
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
            return GenericResponseSerializer({"message": "Choose only one 2FA method"}).Response(400)

        user.is_two_factor_active = True
        user.is_two_factor_mail = bool(new_activate_2fa_mail)
        user.is_two_factor_auth = bool(new_activate_2fa_auth)
    else:
        user.is_two_factor_active = False
        user.is_two_factor_mail = False
        user.is_two_factor_auth = False

    user.save()
    return GenericResponseSerializer().Response(200)

@extend_schema(
    summary="update avatar",
    description="user uploads new avatar, saves it to media/avatars",
    responses={
        400:GenericResponseSerializer,
        200:UpdateAvatarResponseSerializer
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_avatar(request):
    user = request.user
    if "avatar" not in request.FILES:
        return GenericResponseSerializer({"message": "No file uploaded"}).Response(400)

    avatar = request.FILES["avatar"]
    allowed_types = ["image/jpeg", "image/png"]
    if avatar.content_type not in allowed_types:
        return GenericResponseSerializer({"message": "Invalid file type"}).Response(400)

    max_size = 10 * 1024 * 1024 #10MB
    if avatar.size > max_size:
        return GenericResponseSerializer({"message": "File too large (Max 10MB)"}).Response(400)

    avatar_dir = os.path.join(settings.MEDIA_ROOT, "avatars/")
    os.makedirs(avatar_dir, exist_ok=True)
    avatar_path = os.path.join(avatar_dir, f"user_{user.id}.jpg")

    #Open the files at avatar_path for writing in binary (wb)
    with default_storage.open(avatar_path, "wb") as destination:
        for chunk in avatar.chunks():
            destination.write(chunk)

    user.avatar_url = f"{settings.MEDIA_URL}avatars/user_{user.id}.jpg"
    user.save()

    return UpdateAvatarResponseSerializer({"message": "Avatar updated", "avatar_url": user.avatar_url}).Response(200)