from django.contrib.auth import get_user_model, authenticate
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from drf_spectacular.utils import extend_schema
from ..serializers.auth import *
from io import BytesIO
import qrcode
import base64
from rest_framework import serializers

User=get_user_model()

## REGISTER
@extend_schema(
    summary="Register",
    description="Expecting JSON",
    request=RequestRegisterSerializer,
    responses={400: ResponseRegisterErrorSerializer,
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
        return ResponseRegisterErrorSerializer({"email": email_exists,
                                                "username": username_exists}).response(400)
    user=User.objects.create_user(email=email,
                                  username=username,
                                  password=password)
    return GenericResponseSerializer({"message": "OK"}).response(201)

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
        return GenericResponseSerializer({"message": "User does not exist"}).response(404)
    user = User.objects.get(username=username)
    user.send_2fa_mail()
    return ResponsePreLogin({"two_factor_mail": user.is_two_factor_mail,
                             "two_factor_auth": user.is_two_factor_auth}).response(200)

@extend_schema(
    summary="Login",
    description="Expecting JSON",
    request=RequestLoginSerializer,
    responses={404: GenericResponseSerializer,
               200: GenericResponseSerializer}
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    two_factor_mail = request.data.get("two_factor_mail")
    two_factor_auth = request.data.get("two_factor_auth")

    if User.objects.filter(username=username).exists() == False:
        return GenericResponseSerializer({"message": "User does not exist"}).response(404)
    user=authenticate(request, username=username, password=password)
    if user is None:
        return GenericResponseSerializer({"message": "Wrong password"}).response(404)
    if user.is_two_factor_mail and not user.is_mail_code_valid(two_factor_mail):
        return GenericResponseSerializer({"message": "Wrong code"}).response(404)
    else:
        user.reset_2fa_code()
    if user.is_two_factor_auth and not user.is_auth_code_valid(two_factor_auth):
        return GenericResponseSerializer({"message": "Wrong code"}).response(404)
    
    refresh=RefreshToken.for_user(user)
    response=Response({"message": "Login successful"})
    # Set JWT as HttpOnly Cookie
    print("JWT TOKEN IS \n", str(refresh.access_token))
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

## 2FA MAIL
@extend_schema(
    summary="Ask for 2 factor authentication activation mail to be sent",
    description="Expecting nothing",
    responses={200: GenericResponseSerializer({"message": "Sent"})}
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_2fa_mail_activation(request):
    request.user.send_2fa_mail()
    return GenericResponseSerializer({"message": "Sent"}).response(200)

@extend_schema(
    summary="Activate 2 factor authentication via mail",
    description="Expecting JSON",
    request=RequestVerify2faSerializer,
    responses={
        400:GenericResponseSerializer,
        200:GenericResponseSerializer
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
        return GenericResponseSerializer({"message": "Activated"}).response(200)
    return GenericResponseSerializer({"message": "Wrong or expired code"}).response(404)

## LOGOUT
@extend_schema(
    summary="Logout/Deleting JWT Token",
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
    summary="Verify authenticator code",
    description="Verify a TOTP authenticator code, Expecting JSON",
    request=RequestVerify2faSerializer,
    responses={
        400:GenericResponseSerializer({"message": "Wrong code"}),
        200:GenericResponseSerializer({"message": "OK"})
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
        return GenericResponseSerializer({"message": "Activated"}).response(200)
    return GenericResponseSerializer({"message": "Wrong code"}).response(400)
