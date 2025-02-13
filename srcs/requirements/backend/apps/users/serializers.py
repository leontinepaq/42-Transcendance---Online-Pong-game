from rest_framework import serializers
from .models import UserProfile
from rest_framework import status
from rest_framework.response import Response

#updated at read only ???
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserProfile
        fields=['id',
                  'username',
                  'email',
                  'avatar_url',
                  'theme',
                  'is_active',
                  'created_at',
                  'password']
        read_only_fields=['created_at',
                            'updated_at',
                            'id']
        extra_kwargs={
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        user=UserProfile.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user

class InputLoginSerializer(serializers.Serializer):
    username=serializers.CharField(required=True)
    password=serializers.CharField(required=True, 
                                   write_only=True)
    
class InputRegisterSerializer(InputLoginSerializer):
    email=serializers.EmailField(required=True)
    
class InputSend2faSerializer(serializers.Serializer):
    username=serializers.CharField(required=True)
    
class InputVerify2faSerializer(serializers.Serializer):
    username=serializers.CharField(required=True)
    code=serializers.CharField(default=123456)
    activate_mail=serializers.BooleanField(
        default=False,
        help_text="if true, mail will be set as verified in database")

class GenericResponseSerializer(serializers.Serializer):
    message=serializers.CharField(default="OK")
    
    def response(self, _status=200):
            return Response(self.data,
                            status=_status)

class LoginErrorSerializer(GenericResponseSerializer):
    message=serializers.CharField(default="Something went wrong")

class UserNotFoundErrorSerializer(GenericResponseSerializer):
    message=serializers.CharField(default="User does not exist")

class LoginSuccessSerializer(GenericResponseSerializer):
    message=serializers.CharField(default="Password OK")
    two_factor_needed=serializers.BooleanField(default=False)
    qr=serializers.BooleanField(default=False)
    email=serializers.BooleanField(default=False)

class RegisterErrorSerializer(GenericResponseSerializer):
    message=serializers.CharField(default="Username or email already exists")
    username=serializers.BooleanField(default=False)
    email=serializers.BooleanField(default=False)
    
class Verify2faErrorSerializer(GenericResponseSerializer):
    message=serializers.CharField(default="Invalid or expired code")
    expired=serializers.BooleanField(default=False)
    invalid=serializers.BooleanField(default=False)

class VerifyAuthenticatorErrorSerializer(GenericResponseSerializer):
    message=serializers.CharField(default="Missing code, secret or username")

class ActivateAuthenticatorResponseSerializer(serializers.Serializer):
    message = serializers.CharField(default="Two-factor authentication enabled")
    qr_code = serializers.CharField(help_text="Base64-encoded QR code image")
