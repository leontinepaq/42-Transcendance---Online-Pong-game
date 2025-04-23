from rest_framework import serializers
from users.models import UserProfile
from .models import FriendRequest
from users.serializers import GenericResponse

class UserFriendsSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserProfile
        fields = ["id",
                  "username",
                  "email",
                  "avatar_url"]

class FriendRequestSerializer(serializers.ModelSerializer):
    user_id=serializers.IntegerField(source="receiver.id")
    username=serializers.CharField(source="receiver.username")
    class Meta:
        model = FriendRequest
        fields = ["user_id", "username", "created_at"]

class PendingRequestSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="sender.id")
    username = serializers.CharField(source="sender.username")

    class Meta:
        model = FriendRequest
        fields = ["user_id", "username", "created_at"]

class UserIdMissing(GenericResponse):
    DEFAULT={"details": "user_id is required"}
    error_code=400
    details=serializers.CharField(default="user_is is required")