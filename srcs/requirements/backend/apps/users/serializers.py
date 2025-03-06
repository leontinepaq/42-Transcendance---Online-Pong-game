from rest_framework import serializers
from .models import UserProfile
from rest_framework import status
from rest_framework.response import Response

# USERS


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id',
                  'username',
                  'email',
                  'avatar_url',
                  'theme',
                  'is_active',
                  'is_connected',
                  'created_at',
                  'password',
                  'is_two_factor_mail',
                  'is_two_factor_auth']
        read_only_fields = ['created_at',
                            'updated_at',
                            'id']
        extra_kwargs = {
            'password': {'write_only': True},
        }


class UserPublicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id',
                  'username',
                  'avatar_url']
        read_only_fields = ['id',
                            'username',
                            'avatar_url']

# GENERICS


class GenericResponse(serializers.Serializer):
    details = serializers.CharField(default="details")

    def response(self, _status=200):
        return Response(self.data,
                        status=_status)


class RequestUsernameSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)


class UserNotFoundErrorSerializer(GenericResponse):
    details = serializers.CharField(default="User does not exist")
    
    def __init__(self, *args, **kwargs):
        if 'data' not in kwargs:
            kwargs['data'] = {'details': 'User not found'}        
        super().__init__(*args, **kwargs)
        
# PRE-LOGIN


class ResponsePreLogin(GenericResponse):
    details = None
    two_factor_mail = serializers.BooleanField(default=False)
    two_factor_auth = serializers.BooleanField(default=False)

# LOGIN


class RequestLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True,
                                     write_only=True)
    two_factor_code = serializers.CharField(default="123456")


class ResponseLoginError(GenericResponse):
    details = serializers.CharField(default="Wrong code/Wrong password")


class ResponseLoginSuccess(GenericResponse):
    details = serializers.CharField(default="Login successful")

# LOGOUT


class ResponseLogout(serializers.Serializer):
    details = serializers.CharField(default="Logout successful")
# REGISTER


class RequestRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True,
                                     write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)
    email = serializers.EmailField(required=True)


class ResponseRegisterErrorSerializer(GenericResponse):
    details = serializers.CharField(default="Username or email already exists")
    username = serializers.BooleanField(default=False)
    email = serializers.BooleanField(default=False)

# VERIFY 2FA MAIL/QR


class RequestVerify2faSerializer(serializers.Serializer):
    code = serializers.CharField(default=123456)

# GET 2FA QR


class ResponseGet2faQR(serializers.Serializer):
    qr_code = serializers.CharField(help_text="Base64-encoded QR code image")

# REFRESH TOKEN


class ResponseRefreshToken(serializers.Serializer):
    details = serializers.CharField(default="Token refreshed successfully")


class ResponseRefreshTokenErrorMissing(serializers.Serializer):
    details = serializers.CharField(default="No refresh token provided")


class ResponseRefreshTokenErrorInvalid(serializers.Serializer):
    details = serializers.CharField(default="Invalid or expired refresh token")
