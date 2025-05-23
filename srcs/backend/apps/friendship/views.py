from django.shortcuts import render, get_object_or_404
from datetime import timedelta
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import (api_view,
                                       permission_classes)
from rest_framework.response import Response
from users.models import UserProfile
from .models import FriendRequest
from .serializers import UserFriendsSerializer
from users.serializers import (GenericResponse,
                               UserNotFoundErrorSerializer)
from drf_spectacular.utils import (extend_schema,
                                   OpenApiParameter,
                                   OpenApiTypes,
                                   inline_serializer)
from rest_framework import serializers
from .serializers import (FriendRequestSerializer,
                          PendingRequestSerializer,
                          UserIdMissing)

from users.serializers import UserPublicProfileSerializer


@extend_schema(
    summary="Current user sends friend request to other user",
    description="Provide other user_id, current user sends friend request to other \
        user. Backend checks if sender and receiver are the same user, if they are \
            blocked, if friend request has already been sent, if they are already \
                friends.",
    responses={
        200: GenericResponse,
        400: inline_serializer("Send request",
                               {"details": serializers.CharField(default="details")}),
    },
    parameters=[OpenApiParameter(name="user_id",
                                 type=OpenApiTypes.INT,
                                 location=OpenApiParameter.QUERY,
                                 required=True)],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_request(request, user_id):
    sender = request.user
    if not user_id:
        return UserIdMissing().response()
    receiver = get_object_or_404(UserProfile, id=user_id)

    details = None
    if sender == receiver:
        details = "You cannot send a friend request to yourself"
    elif sender.friends.filter(id=receiver.id).exists():
        details = "You are already friends with this user"
    elif receiver.blocked.filter(id=sender.id).exists():
        details = "This user blocked you"
    elif sender.blocked.filter(id=receiver.id).exists():
        details = "You cannot send a friend request to a user you blocked"
    elif FriendRequest.objects.filter(sender=sender,
                                      receiver=receiver).exists():
        details = "Friend request already sent"
    elif FriendRequest.objects.filter(sender=receiver,
                                      receiver=sender).exists():
        details = "You have a pending friend request from this user"
    else:
        friend_request = FriendRequest.objects.create(sender=sender,
                                                      receiver=receiver)
        return GenericResponse().response()

    return GenericResponse({"details": details}).response(400)


@extend_schema(
    summary="Display current user's pending friend requests's senders",
    description="Returns a list of pending friend requests's senders received by the current user.",
    responses={200: PendingRequestSerializer(many=True)}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_request(request):
    user = request.user
    friend_requests = FriendRequest.objects.filter(receiver=user)
    senders = [friend_request.sender for friend_request in friend_requests]

    serializer = UserFriendsSerializer(senders, many=True)

    return Response(serializer.data, status=200)


@extend_schema(
    summary="Accepts friend request",
    description="After a friend request has been sent to a user, call this endpoint \
        when the user accepts the friend request, making them both friends and \
        deleting the friend request. Backend checks if they are already friends.",
    responses={200: GenericResponse,
               400: UserIdMissing,
               404: inline_serializer(
                   "accept404",
                   {"details": serializers.CharField(default="No pending friend \
                       request found")})},
    parameters=[OpenApiParameter(name="user_id",
                                 type=OpenApiTypes.INT,
                                 location=OpenApiParameter.QUERY,
                                 required=True)],

)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_request(request, user_id):
    receiver = request.user
    if not user_id:
        return UserIdMissing().response()

    sender = UserProfile.objects.filter(id=user_id).first()
    friend_request = FriendRequest.objects.filter(sender=sender,
                                                  receiver=receiver).first()
    if not friend_request:
        return Response({"details": "Friend request not found"},
                        status=404)
    receiver.friends.add(sender)
    friend_request.delete()
    return GenericResponse().response()


@extend_schema(
    summary="Decline friend request",
    description="After a friend request has been sent to a user, call this endpoint \
        when the user declines the friend request, deleting the friend request",
    responses={200: GenericResponse,
               400: UserIdMissing,
               404: inline_serializer(
                   "decline404",
                   {"details": serializers.CharField(default="Friend request not found")})},
    parameters=[OpenApiParameter(name="user_id",
                                 type=OpenApiTypes.INT,
                                 location=OpenApiParameter.QUERY,
                                 required=True)],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def decline_request(request, user_id):
    receiver = request.user
    if not user_id:
        return UserIdMissing().response()

    sender = UserProfile.objects.filter(id=user_id).first()
    friend_request = FriendRequest.objects.filter(sender=sender,
                                                  receiver=receiver).first()
    if not friend_request:
        return Response({"details": "Friend request not found"}, status=400)
    friend_request.delete()
    return GenericResponse().response()


@extend_schema(
    summary="Deletes friend",
    description="Provide other user ID. Current user deletes user_id friend",
    responses={200: GenericResponse,
               400: UserIdMissing,
               404: inline_serializer(
                   "delete404",
                   {"details": serializers.CharField(default="You are not friends\
                        with this user")})},
    parameters=[OpenApiParameter(name="user_id",
                                 type=OpenApiTypes.INT,
                                 location=OpenApiParameter.QUERY,
                                 required=True)],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delete_friend(request, user_id):
    user = request.user
    if not user_id:
        return UserIdMissing().response()

    unfriend = UserProfile.objects.filter(id=user_id).first()
    if not user.friends.filter(id=unfriend.id).exists():
        return Response({"details": "You are not friends with this user"},
                        status=404)
    user.friends.remove(unfriend) 
    return GenericResponse().response()


@extend_schema(
    summary="Blocks other user",
    description="Provide other user ID. Current user blocks other user, making him \
        unable to add him as friend again",
    responses={200: GenericResponse,
               400: UserIdMissing,
               400: inline_serializer(
                   "block400bis",
                   {"details": serializers.CharField(default="User already blocked")}),
               404: UserNotFoundErrorSerializer},
    parameters=[OpenApiParameter(name="user_id",
                                 type=OpenApiTypes.INT,
                                 location=OpenApiParameter.QUERY,
                                 required=True)],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def block_user(request, user_id):
    user = request.user
    if not user_id:
        return UserIdMissing().response()
    blocked = UserProfile.objects.filter(id=user_id).first()
    if not blocked:
        return UserNotFoundErrorSerializer().response()
    if user.blocked.filter(id=blocked.id).exists():
        return Response({"details": "User already blocked"}, status=400)
    user.blocked.add(blocked)
    if user.friends.filter(id=blocked.id).exists():
        user.friends.remove(blocked) 
    return GenericResponse().response()


@extend_schema(
    summary="Unblocks user",
    description="Provide other user ID. Current user unblocks other user, making \
        him able to send friend requests again.",
    responses={200: GenericResponse,
               400: UserIdMissing,
               400: inline_serializer(
                   "unblock400bis",
                   {"details": serializers.CharField(default="User not blocked")}),
               404: UserNotFoundErrorSerializer},
    parameters=[OpenApiParameter(name="user_id",
                                 type=OpenApiTypes.INT,
                                 location=OpenApiParameter.QUERY,
                                 required=True)],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unblock_user(request, user_id):
    user = request.user
    if not user_id:
        return UserIdMissing().response()
    unblocked = UserProfile.objects.filter(id=user_id).first()
    if not unblocked:
        return UserNotFoundErrorSerializer().response()
    if not user.blocked.filter(id=unblocked.id).exists():
        return Response({"details": "User not blocked"}, status=400)
    user.blocked.remove(unblocked)
    return GenericResponse().response()

@extend_schema(
    summary="Display current user's friends",
    description="Nothing needed, just a small endpoint to give you a list of all \
        current user's friends",
    responses={200: UserPublicProfileSerializer(many=True),}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_friends(request):
    user = request.user
    friends = user.friends.all()
    serializer = UserPublicProfileSerializer(friends, many=True)
    return Response(serializer.data, status=200)


@extend_schema(
    summary="Display other user's friends",
    description="Give user ID, returns user's list of friends",
    responses={200: UserPublicProfileSerializer(many=True),
               400: UserIdMissing,
               404: UserNotFoundErrorSerializer},
    parameters=[OpenApiParameter(name="user_id",
                                 type=OpenApiTypes.INT,
                                 location=OpenApiParameter.QUERY,
                                 required=True)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_other_user_friends(request, user_id):
    if not user_id:
        return UserIdMissing().response()
    user = UserProfile.objects.filter(id=user_id)
    if not user.exists():
        return UserNotFoundErrorSerializer().response()
    friends = user.first().friends.all()
    serializer = UserPublicProfileSerializer(friends, many=True)
    return Response(serializer.data, status=200)


@extend_schema(
    summary="Display current user's block list",
    description="Gives you a list of all current user's blocked users",
    responses={200: UserPublicProfileSerializer(many=True),}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_blocked(request):
    user = request.user
    blocked = user.blocked.all()
    serializer = UserPublicProfileSerializer(blocked, many=True)
    return Response(serializer.data, status=200)


@extend_schema(
    summary="display current user's pending sent friend requests",
    description="Gives you a list of all current user's pending sent friend \
        requests. Nothing needed",
    responses={200: FriendRequestSerializer(many=True)}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sent_friend_requests(request):
    user = request.user
    friend_requests = FriendRequest.objects.filter(sender=user)
    serializer=FriendRequestSerializer(friend_requests, many=True)
    return Response(serializer.data, status=200)

@extend_schema(
    summary="Get number of current user's pending friend requests's senders",
    description="Gives you the number of pending friend requests's senders received by the current user.",
    responses={200: inline_serializer("pending_count", fields={"pending_count": serializers.IntegerField(default=0)})}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_pending_count(request):
    user = request.user
    friend_requests_count = FriendRequest.objects.filter(receiver=user).count()
    return Response({"pending_count": friend_requests_count}, status=200)
