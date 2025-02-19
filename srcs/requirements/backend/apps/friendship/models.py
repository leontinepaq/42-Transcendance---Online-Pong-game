from django.db import models
from users.models import UserProfile

class Friendship(models.Model):
    status =    models.CharField(
        max_length=11,
        choices=[("not_friends", "Not Friends"), ("pending", "Pending"), ("accepted", "Accepted"),]
        default="not_friends",
        )
    friend1 =   models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="friend of")
    friend2 =   models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="friend of")