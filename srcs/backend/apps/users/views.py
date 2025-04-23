from django.contrib.auth import (get_user_model,
                                 authenticate)
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.decorators import (api_view,
                                       permission_classes)
from rest_framework.permissions import (AllowAny,
                                        IsAuthenticated)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from drf_spectacular.utils import (extend_schema,
                                   OpenApiParameter,
                                   inline_serializer)
from .serializers import *
from io import BytesIO
from rest_framework import serializers
from django.conf import settings
import qrcode
import pyotp
import base64
import string
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404


User=get_user_model()

## REGISTER
@extend_schema(
    summary="Register",
    description="Expecting JSON",
    request=RequestRegisterSerializer,
    responses={400: ResponseRegisterErrorSerializer,
               201: GenericResponse}
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email=request.data.get("email")
    username=request.data.get("username")
    password=request.data.get("password")
    confirm_password=request.data.get("confirm_password")

    try:
        validate_email(email)
    except ValidationError:
        return GenericResponse({"details": "Invalid email format"}).response(400)
    if not password or not confirm_password:
        return GenericResponse({"details": "Both fields required"}).response(400)
    if password != confirm_password:
        return GenericResponse({"details": "Passwords do not match"}).response(400)

    username_exists=User.objects.filter(username=username).exists()
    email_exists=User.objects.filter(email=email).exists()
    
    if username_exists or email_exists:
        return ResponseRegisterErrorSerializer({"email": email_exists,
                                                "username": username_exists}).response(400)
    user=User.objects.create_user(email=email,
                                  username=username,
                                  password=password)
    return GenericResponse({"details": "OK"}).response(201)

## LOGIN
@extend_schema(
    summary="Pre_login",
    description="Sending username to know the needed features to log in (password only / password + mail code / password + 2-auth code)",
    request=RequestUsernameSerializer,
    responses={
     404:UserNotFoundErrorSerializer,
     200:ResponsePreLogin}
)
@api_view(["POST"])
@permission_classes([AllowAny])
def pre_login(request):
    username=request.data.get("username")

    if User.objects.filter(username=username).exists() == False:
        return UserNotFoundErrorSerializer().response()
    user = User.objects.get(username=username)
    if user.is_two_factor_mail:
        user.send_2fa_mail()
    return ResponsePreLogin({"two_factor_mail": user.is_two_factor_mail,
                             "two_factor_auth": user.is_two_factor_auth}).response(200)

@extend_schema(
    summary="Login",
    description="Expecting JSON",
    request=RequestLoginSerializer,
    responses={404: UserNotFoundErrorSerializer,
               401: ResponseLoginError,
               200: ResponseLoginSuccess}
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    two_factor_code = request.data.get("two_factor_code")

    if User.objects.filter(username=username).exists() == False:
        return UserNotFoundErrorSerializer({}).response(404)
    user=authenticate(request, username=username, password=password)
    if user is None:
        return ResponseLoginError({"details": "Wrong password"}).response(401)
    if user.is_two_factor_mail and not user.is_mail_code_valid(two_factor_code):
        return ResponseLoginError({"details": "Wrong code"}).response(401)
    else:
        user.reset_2fa_code()
    if user.is_two_factor_auth and not user.is_auth_code_valid(two_factor_code):
        return ResponseLoginError({"details": "Wrong code"}).response(401)
    
    refresh=RefreshToken.for_user(user)
    response=Response({"details": "Login successful"})
    response.set_cookie(key=settings.SIMPLE_JWT["AUTH_COOKIE"],
                        value=str(refresh.access_token),
                        max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                        httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                        secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"])
    response.set_cookie(key=settings.SIMPLE_JWT["REFRESH_COOKIE"],
                        value=str(refresh),
                        max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                        httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                        secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"])
    return response

## 2FA MAIL
@extend_schema(
    summary="Ask for 2 factor authentication activation mail to be sent",
    description="Expecting nothing",
    responses={200: inline_serializer("Mail sent", fields={"details": serializers.CharField(default="Mail sent")})}
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_2fa_mail_activation(request):
    request.user.send_2fa_mail()
    return GenericResponse({"details": "Mail sent"}).response(200)

@extend_schema(
    summary="Activate 2 factor authentication via mail. To be used after calling send_2fa_mail_activation",
    description="Expecting JSON",
    request=RequestVerify2faSerializer,
    responses={
        400:inline_serializer("Wrong code",
                              fields = {"details": serializers.CharField(default="Wrong or expired code")}),
        200:inline_serializer("Activated",
                              fields = {"details": serializers.CharField(default="Activated")}),
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_2fa_mail(request):
    user=request.user
    code=request.data.get('code')
    if user.is_mail_code_valid(code):
        user.reset_2fa_code()
        user.is_two_factor_mail = True
        user.is_two_factor_auth = False
        user.save()
        return GenericResponse({"details": "Activated"}).response(200)
    return GenericResponse({"details": "Wrong or expired code"}).response(404)

## LOGOUT
@extend_schema(
    summary="Logout/Deleting JWT Token",
    description="Expecting nothing",
    responses={200: ResponseLogout}
)
@permission_classes([IsAuthenticated])
@api_view(["POST"])
def logout(request):    
    response=Response(ResponseLogout().data)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response

## AUTH CHECK
@api_view(["GET"])
@extend_schema(
    summary="Logout",
    description="Expecting nothing",
    responses={200: RequestUsernameSerializer}
)
@permission_classes([IsAuthenticated])
def auth_check(request):
    return Response({"username": request.user.username}, status = 200)

## 2FA QR
@extend_schema(
    summary='Ask for 2 factor via Authenticator QR Code',
    description="Generates TOTP secret and provides QR code",
    responses={200: ResponseGet2faQR,
               404: UserNotFoundErrorSerializer}
)
@api_view(["POST"])    
@permission_classes([IsAuthenticated])
def get_2fa_qr_activation(request):
    user=request.user
    user.totp_secret=pyotp.random_base32()
    user.save()
    
    totp = pyotp.TOTP(user.totp_secret)
    uri = totp.provisioning_uri(name=user.username,
                                issuer_name="Transcendance")
    img = qrcode.make(uri)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    return Response({"qr_code": f"data:image/png;base64,{qr_base64}"},
                    status=status.HTTP_200_OK)

@extend_schema(
    summary="Activates 2FA via authenticator. To be used after calling get_2fa_qr_activation",
    description="Verify a TOTP authenticator code, Expecting JSON",
    request=RequestVerify2faSerializer,
    responses={
        400:inline_serializer("Wrong code",
                              fields = {"details": serializers.CharField(default="Wrong or expired code")}),
        200:inline_serializer("Activated",
                              fields = {"details": serializers.CharField(default="Activated")}),
    }
)
@api_view(["POST"])
@permission_classes([AllowAny])
def verify_2fa_qr(request):
    user=request.user
    code=request.data.get('code')
    if user.is_auth_code_valid(code):
        user.is_two_factor_auth = True
        user.is_two_factor_mail = False
        user.save()
        return GenericResponse({"details": "Activated"}).response(200)
    return GenericResponse({"details": "Wrong or expired code"}).response(400)

## TOKEN REFRESH
class CookieTokenRefreshView(TokenRefreshView):
    @extend_schema(
        summary="Refresh JWT Token",
        description="Refreshes the access token using the refresh token stored in cookies.",
        parameters=[
            OpenApiParameter(
                name=settings.SIMPLE_JWT["REFRESH_COOKIE"],
                type=str,
                location=OpenApiParameter.COOKIE,
                required=True,
                description="Refresh token stored in cookies"
            )
        ],
        responses={200: ResponseRefreshToken,
                   400: ResponseRefreshTokenErrorInvalid,
                   401: ResponseRefreshTokenErrorMissing}
    )
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["REFRESH_COOKIE"])

        if not refresh_token:
            return ResponseRefreshTokenErrorMissing().response()
        
        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            return ResponseRefreshTokenErrorInvalid.response()

        access_token = serializer.validated_data.get("access")
        response = ResponseRefreshToken().response()
        response.set_cookie(key=settings.SIMPLE_JWT["AUTH_COOKIE"],
                            value=access_token,
                            max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"])
        return response

@api_view(["POST"])
@permission_classes([AllowAny])
def forgotten_password(request):
    username = request.data.get("username")
    user = get_object_or_404(UserProfile, username=username)
    new_password = get_random_string(length=8,allowed_chars=string.ascii_letters + string.digits)
    user.set_password(new_password)
    user.save()
    send_mail('Forgotten Password',
              f'Your new password is: {new_password}',
              settings.DEFAULT_FROM_EMAIL,
              [user.email],
              fail_silently=False)
    return GenericResponse({"details": "Password reset"}).response(200)
