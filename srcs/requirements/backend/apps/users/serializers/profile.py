from rest_framework import serializers
from .auth import GenericResponseSerializer

class UpdateAvatarResponseSerializer(GenericResponseSerializer):
    avatar_url = serializers.URLField(required=False)