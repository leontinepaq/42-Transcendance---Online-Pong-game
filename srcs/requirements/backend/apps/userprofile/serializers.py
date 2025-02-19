from rest_framework import serializers
from users.models import UserProfile
from users.serializers import GenericResponseSerializer
from rest_framework import status
from rest_framework.response import Response

class UpdateAvatarResponseSerializer(GenericResponseSerializer):
    avatar_url = serializers.URLField(required=False)
    
class UpdateEmailRequestSerializer(serializers.Serializer):
    new_email = serializers.EmailField()

class UpdateUsernameRequestSerializer(serializers.Serializer):
    new_username = serializers.CharField(max_length=30)

class UpdatePasswordRequestSerializer(serializers.Serializer):
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

class Update2FARequestSerializer(serializers.Serializer):
    new_activate_2fa = serializers.BooleanField()
    new_activate_2fa_mail = serializers.BooleanField()
    new_activate_2fa_auth = serializers.BooleanField()
