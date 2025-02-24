from django.urls import path
from .views import (send_friend_request, accept_friend_request, decline_friend_request, 
    block_user, unblock_user, get_user_friends, get_other_user_friends, get_user_blocked, 
    delete_friend, get_sent_friend_requests, get_received_friend_requests)

urlpatterns = [
    path("send-friend-request/", send_friend_request, name="send_friend_request"),
    path("accept-friend-request/", accept_friend_request, name="accept_friend_request"),
    path("decline-friend-request/", decline_friend_request, name="decline_friend_request"),
    path("block-user/", block_user, name="block_user"),
    path("unblock-user/", unblock_user, name="unblock_user"),
    path("get-user-friends/", get_user_friends, name="get_user_friends"),
    path("get-other-user-friends/", get_other_user_friends, name="get_other_user_friends"),
    path("get-user-blocked/", get_user_blocked, name="get_user_blocked"),
    path("delete-friend/", delete_friend, name="delete_friend"),
    path("get-sent-friend-requests/", get_sent_friend_requests, name="get_sent_friend_requests"),
    path("get-received-friend-requests/", get_received_friend_requests, name="get_received_friend_requests")
]