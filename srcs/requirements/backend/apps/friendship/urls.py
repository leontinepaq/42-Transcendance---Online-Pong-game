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
    path("send-request/<int:user_id>/", send_request, name="send_request"),
    path("accept-request/<int:user_id>/", accept_request, name="accept_request"),
    path("decline-request/<int:user_id>/", decline_request, name="decline_request"),
    path("delete-friend/<int:user_id>/", delete_friend, name="delete_friend"),
    path("block-user/<int:user_id>/", block_user, name="block_user"),
    path("unblock-user/<int:user_id>/", unblock_user, name="unblock_user"),
    #GET
    path("friends/", get_friends, name="get_user_friends"),
    path("other-user-friends/<int:user_id>/", get_other_user_friends, name="get_other_user_friends"),
    path("blocked/", get_user_blocked, name="get_user_blocked"),
    path("pending-requests/", pending_request, name="pending_requests"),
    path("sent-requests/", get_sent_friend_requests, name="get_sent_friend_requests"),
]