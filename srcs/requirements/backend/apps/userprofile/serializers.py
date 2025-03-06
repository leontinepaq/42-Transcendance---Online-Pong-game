from rest_framework import serializers
from users.serializers import GenericResponse

class UpdateAvatarResponseSerializer(GenericResponse):
    avatar_url = serializers.URLField(required=False)
    
class UpdateEmailRequestSerializer(serializers.Serializer):
    new_email = serializers.EmailField(required=True)

class UpdateUsernameRequestSerializer(serializers.Serializer):
    new_username = serializers.CharField(max_length=30)

class UpdatePasswordRequestSerializer(serializers.Serializer):
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()
