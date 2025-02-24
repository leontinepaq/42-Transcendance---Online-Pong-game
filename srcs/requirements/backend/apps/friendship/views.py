from django.shortcuts import render, get_object_or_404
from datetime import timedelta
from django.db.models import Q
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from users.models import UserProfile
from .models import FriendRequest
from .serializers import UserFriendsSerializer
from users.serializers import GenericResponseSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

@extend_schema(
    summary="Current user sends friend request to other user",
    description="Provide other user_id, current user sends friend request to other user. Backend checks if sender and receiver are the same user, if they are blocked, if friend request has already been sent, if they are already friends.",
    responses={
        200: GenericResponseSerializer,
        404: GenericResponseSerializer,
        400: GenericResponseSerializer,
    },
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    sender = request.user
    receiver_id = request.query_params.get("user_id")
    if not receiver_id:
        return Response({"message": "User ID is required"}, status=400)

    receiver = get_object_or_404(UserProfile, id=receiver_id)

    if sender == receiver:
        return Response({"message": "You can't send a friend request to yourself!"}, status=400)

    if sender.friends.filter(id=receiver.id).exists():
        return Response({"message":"You are already friends with this user"}, status=400)

    if receiver.blocked.filter(id=sender.id).exists():
        return Response({"message": "This user blocked you motherfucker"}, status=400)

    if sender.blocked.filter(id=receiver.id).exists():
        return Response({"message": "You cannot send a friend request to a user you blocked"}, status=400)

    if FriendRequest.objects.filter(sender=sender, receiver=receiver).exists():
        return Response({"message": "Friend request already sent"}, status=400)

    if FriendRequest.objects.filter(sender=receiver, receiver=sender).exists():
        return Response({"message": "This user already sent you a friend request. Go accept it"}, status=400)

    friend_request = FriendRequest.objects.create(sender=sender, receiver=receiver)

    return Response({"message": "Friend request sent successfully"}, status=200)
    
@extend_schema(
    summary="Accepts friend request",
    description="After a friend request has been sent to a user, call this endpoint when the user accepts the friend request, making them both friends and deleting the friend request. Backend checks if they are already friends.",
    responses={
        200: GenericResponseSerializer,
        400: GenericResponseSerializer
    },
    parameters=[OpenApiParameter(name="sender_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],

)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def accept_friend_request(request):
    receiver = request.user
    sender_id = request.query_params.get("sender_id")
    if not sender_id:
        return Response({"message": "Sender ID is required"}, status=400)

    sender = get_object_or_404(UserProfile, id=sender_id)

    friend_request = FriendRequest.objects.filter(sender=sender, receiver=receiver).first()
    if not friend_request:
        return Response({"message": "No pending friend request found"}, status=404)

    if sender.friends.filter(id=receiver.id).exists():
        return Response({"message": "You are already friends with this user"}, status=400)

    receiver.friends.add(sender)
    friend_request.delete()

    return Response({"message": "Friend request accepted"}, status=200)

@extend_schema(
    summary="Decline friend request",
    description="After a friend request has been sent to a user, call this endpoint when the user declines the friend request, deleting the friend request",
    responses={
        200: GenericResponseSerializer,
        400: GenericResponseSerializer
    },
    parameters=[OpenApiParameter(name="sender_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def decline_friend_request(request):
    receiver = request.user
    sender_id = request.query_params.get("sender_id")
    if not sender_id:
        return Response({"message": "Sender ID is required"}, status=400)

    sender = get_object_or_404(UserProfile, id=sender_id)

    friend_request = FriendRequest.objects.filter(sender=sender, receiver=receiver).first()
    if not friend_request:
        return Response({"message": "No pending friend request found"}, status=400)

    friend_request.delete()

    return Response({"message": "Friend request declined"}, status=200)

@extend_schema(
    summary="Deletes friend",
    description="Provide other user ID. Current user deletes user_id friend",
    responses={
        200: GenericResponseSerializer,
        400: GenericResponseSerializer,
    },
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delete_friend(request):
    user = request.user
    unfriend_id = request.query_params.get("user_id")
    if not unfriend_id:
        return Response({"message": "User ID is required"}, status=400)

    unfriend = get_object_or_404(UserProfile, id=unfriend_id)

    if not user.friends.filter(id=unfriend.id).exists():
        return Response({"message": "You are not friends with this user"}, status=400)

    user.friends.remove(unfriend)
    return Response({"message": "User successfully unfriended"}, status=200)

@extend_schema(
    summary="Blocks other user",
    description="Provide other user ID. Current user blocks other user, making him unable to add him as friend again",
    responses={
        200: GenericResponseSerializer,
        400: GenericResponseSerializer,
        404: GenericResponseSerializer,
    },
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def block_user(request):
    user = request.user
    blocked_id = request.query_params.get("user_id")
    if not blocked_id:
        return Response({"message": "User ID is required"}, status=400)

    blocked = get_object_or_404(UserProfile, id=blocked_id)

    if user.blocked.filter(id=blocked.id).exists():
        return Response({"message": "User is already blocked"}, status=400)

    user.blocked.add(blocked)
    return Response({"message": "User succesfully blocked"}, status=200)


@extend_schema(
    summary="Unblocks user",
    description="Provide other user ID. Current user unblocks other user, making him able to send friend requests again.",
    responses={
        200: GenericResponseSerializer,
        400: GenericResponseSerializer,
    },
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unblock_user(request):
    user = request.user
    unblocked_id = request.query_params.get("user_id")
    if not unblocked_id:
        return Response({"message": "User ID is required"}, status=400)

    unblocked = get_object_or_404(UserProfile, id=unblocked_id)

    if not user.blocked.filter(id=unblocked.id).exists():
        return Response({"message": "User is not blocked"}, status=400)

    user.blocked.remove(unblocked)
    return Response({"message": "User successfully unblocked"}, status=200)

@extend_schema(
    summary="Display current user's friends",
    description="Nothing needed, just a small endpoint to give you a list of all current user's friends",
    responses={
        200: GenericResponseSerializer,
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_friends(request):
    user = request.user
    friends = user.friends.all()
    serializer = UserFriendsSerializer(friends, many=True)

    return Response(serializer.data, status=200)

@extend_schema(
    summary="Display other user's friends",
    description="Give user ID, returns user's list of friends",
    responses={
        200: GenericResponseSerializer,
    },
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_other_user_friends(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        return Response({"message": "User ID is required"}, status=400)

    user = get_object_or_404(UserProfile, id=user_id)
    friends = user.friends.all()
    serializer = UserFriendsSerializer(friends, many=True)

    return Response(serializer.data, status=200)

@extend_schema(
    summary="Display current user's block list",
    description="Gives you a list of all current user's blocked users",
    responses={
        200: GenericResponseSerializer,
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_blocked(request):
    user = request.user
    blocked = user.blocked.all()
    serializer = UserFriendsSerializer(blocked, many=True)

    return Response(serializer.data, status=200)

@extend_schema(
    summary="display current user's pending received friend requests",
    description="Gives you a list of all current user's pending received friend requests. Nothing needed",
    responses={
        200: GenericResponseSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_received_friend_requests(request):
    user = request.user
    friend_requests = FriendRequest.objects.filter(receiver=user)
    data = [
        {
            "sender_id": fr.sender.id,
            "sender_username": fr.sender.username,
            "sent_at": fr.created_at,
        }
        for fr in friend_requests
    ]
    return Response({"friend_requests_received": data}, status=200)

@extend_schema(
    summary="display current user's pending sent friend requests",
    description="Gives you a list of all current user's pending sent friend requests. Nothing needed",
    responses={
        200: GenericResponseSerializer
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sent_friend_requests(request):
    user = request.user
    friend_requests = FriendRequest.objects.filter(sender=user)
    data = [
        {
            "receiver_id": fr.receiver.id,
            "sender_username": fr.receiver.username,
            "sent_at": fr.created_at,
        }
        for fr in friend_requests
    ]
    return Response({"friend_requests_sent": data}, status=200)
