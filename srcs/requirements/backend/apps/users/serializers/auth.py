from rest_framework import serializers
from ..models import UserProfile
from rest_framework import status
from rest_framework.response import Response

## GENERICS
class GenericResponseSerializer(serializers.Serializer):
    message=serializers.CharField(default="message")
    
    def response(self, _status=200):
            return Response(self.data,
                            status=_status)
            
class RequestUsernameSerializer(serializers.Serializer):
    username=serializers.CharField(required=True)
            
class UserNotFoundErrorSerializer(GenericResponseSerializer):
    message=serializers.CharField(default="User does not exist")
    
## PRE-LOGIN
class ResponsePreLogin(GenericResponseSerializer):
    message = None
    two_factor_mail = serializers.BooleanField(default=False)
    two_factor_auth = serializers.BooleanField(default=False)
 
## LOGIN
class RequestLoginSerializer(serializers.Serializer):
    username=serializers.CharField(required=True)
    password=serializers.CharField(required=True, 
                                   write_only=True)
    two_factor_auth = serializers.CharField(default = "123456")
    two_factor_mail = serializers.CharField(default = "123456")

## REGISTER  
class RequestRegisterSerializer(RequestLoginSerializer):
    email=serializers.EmailField(required=True)

class ResponseRegisterErrorSerializer(GenericResponseSerializer):
    message=serializers.CharField(default="Username or email already exists")
    username=serializers.BooleanField(default=False)
    email=serializers.BooleanField(default=False)

## VERIFY 2FA MAIL/QR
class RequestVerify2faSerializer(serializers.Serializer):
    code=serializers.CharField(default=123456)

## GET 2FA QR
class ResponseGet2faQR(serializers.Serializer):
    qr_code = serializers.CharField(help_text="Base64-encoded QR code image")
