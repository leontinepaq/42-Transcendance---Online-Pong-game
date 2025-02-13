from rest_framework import serializers
from users.models import UserProfile
from users.serializers import GenericResponseSerializer
from rest_framework import status
from rest_framework.response import Response

class UpdateAvatarResponseSerializer(GenericResponseSerializer):
    avatar_url = serializers.URLField(required=False)