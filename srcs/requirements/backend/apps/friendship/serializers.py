from rest_framework import serializers
from users.models import UserProfile

class UserFriendsSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserProfile
        fields = ["id", "username", "avatar_url"]

