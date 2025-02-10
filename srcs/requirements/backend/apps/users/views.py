from django.contrib.auth import get_user_model, authenticate
from rest_framework.response import Response
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
from datetime import timedelta, datetime
from io import BytesIO
import pyotp
import qrcode
import base64
import time

User = get_user_model()

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get("email")
    username = request.data.get("username")
    password = request.data.get("password")

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered."},
                        status=status.HTTP_404_NOT_FOUND)
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already registered."},
                        status=status.HTTP_404_NOT_FOUND)

    user = User.objects.create_user(email=email,
                                    username=username,
                                    password=password)
    return Response({'message': 'Registration successful.'},
                    status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_activation_link(request):
    username = request.data.get("username")

    user = User.objects.filter(username=username).first()
    if user is None:
        return Response({'message': 'User does not exists.'},
                        status=status.HTTP_404_NOT_FOUND)

    # Generate the activation token and email
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(str(user.pk).encode())
 
    # Get current site to include in the activation link
    current_site = get_current_site(request)
    activation_link = f"{current_site.domain}/activate/{uid}/{token}"
 
     # Send email with activation link
    subject = 'Activate your account'
    message = render_to_string('activation_email.html', 
                               {'user': user,
                                'activation_link': activation_link})
    send_mail(subject,
              message,
              settings.DEFAULT_FROM_EMAIL,
              [user.email])
    return Response({'message': 'Mail sent'},
                    status = status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def	activate(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_user_model().objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    if (user is not None
        and default_token_generator.check_token(user, token)):
        user.is_active = True
        user.save()
        return Response({"message": "Activated"},
                        status = status.HTTP_202_ACCEPTED)
    else:
        return Response({"message": "Expired link"},
                        status = status.HTTP_404_NOT_FOUND)

@permission_classes([IsAuthenticated])
def send_2fa(user):
    user.two_factor_code = get_random_string(length=6,
                                             allowed_chars=string.digits)
    user.two_factor_expiry = timezone.now() + timedelta(minutes=15)
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

@api_view(["POST"])
def verify_2fa(request):
    code = request.data.get('code')
    username = request.data.get('username')
    
    if not all([code, username]):
        return Response({'error': 'missing info'},
                        status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.get(username=username)

    if user.two_factor_code != code:
        return Response({"message": "wrong code"},
                        status = status.HTTP_403_FORBIDDEN)
    if user.two_factor_expiry < timezone.now():
        return Response({"message": "expired code"},
                        status = status.HTTP_403_FORBIDDEN)

    user.two_factor_expiry = None
    user.two_factor_code = None
    user.save()    
    return refreshToken(user)
    
def refreshToken(user):
    refresh = RefreshToken.for_user(user)
    return Response({'access': str(refresh.access_token),
                     'refresh': str(refresh)},
                    status = status.HTTP_200_OK)

def refreshToken(user):
    refresh = RefreshToken.for_user(user)
    return Response({'access': str(refresh.access_token), 'refresh': str(refresh)}, status = status.HTTP_200_OK)

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

    print(f"Generated secret: {secret}")
    print(f"Generated URI: {uri}")
    print(f"Current valid code: {totp.now()}")
    
    img = qrcode.make(uri)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return Response({"qr_code": f"data:image/png;base64,{qr_base64}"}, status=status.HTTP_200_OK)

@api_view(["POST"])
def verify_authenticator(request):
    code = request.data.get('code')
    username = request.data.get('username')

    if not all([code, username]):
        return Response({'error': 'missing info'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.get(username=username)

    if not user.totp_secret:
        return Response({"message": "Authenticator not set up"}, status=status.HTTP_400_BAD_REQUEST)

    totp = pyotp.TOTP(user.totp_secret)
    
    if totp.verify(code, valid_window=1):
        return refreshToken(user)

    return Response({"message": "Invalid code, please try again"}, status=status.HTTP_403_FORBIDDEN)
    
@permission_classes([AllowAny])
@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    # if user.is_active == False:
    #     send_mail(request)
    #     return Response({"is_activated: false"},
    #                     status=status.HTTP_200_OK)
    if user.is_two_factor_active:
        if user.is_two_factor_mail:
            return send_2fa(user)
        elif user.is_two_factor_auth:
            return Response({"redirect_url": "/verify_authenticator/"}, status=status.HTTP_200_OK)

    return Response({"Message": "Success!"}, status=status.HTTP_200_OK)
