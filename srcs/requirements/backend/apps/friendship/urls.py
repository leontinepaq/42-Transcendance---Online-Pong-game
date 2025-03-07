from django.urls import path
from .views import (send_request,
                    pending_request,
                    accept_request,
                    decline_request,                    
                    delete_friend,
                    block_user,
                    unblock_user,
                    get_friends,
                    get_other_user_friends,
                    get_user_blocked,
                    get_sent_friend_requests,
                    pending_request)

urlpatterns = [
    #POST
    path("send_request/", send_request, name="send_request"),
    path("accept_request/", accept_request, name="accept_request"),
    path("decline_request/", decline_request, name="decline_request"),
    path("delete_friend/", delete_friend, name="delete_friend"),
    path("block_user/", block_user, name="block_user"),
    path("unblock_user/", unblock_user, name="unblock_user"),
    #GET
    path("", get_friends, name="get_user_friends"),
    path("other_user/", get_other_user_friends, name="get_other_user_friends"),
    path("blocked/", get_user_blocked, name="get_user_blocked"),
    path("pending_requests/", pending_request, name=""),
    path("sent_requests/", get_sent_friend_requests, name="get_sent_friend_requests"),
]