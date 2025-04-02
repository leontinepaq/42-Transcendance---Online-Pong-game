from django.db import models
from users.models import UserProfile


class FriendRequest(models.Model):
    sender = models.ForeignKey(UserProfile,
                               on_delete=models.CASCADE,
                               related_name="sent_friend_request")
    receiver = models.ForeignKey(UserProfile,
                                 on_delete=models.CASCADE,
                                 related_name="received_friend_request")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("sender",
                           "receiver")
