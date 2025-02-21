from django.db import models
from users.models import UserProfile

#add ID ? 
class Participant(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=30, blank=True, null=True)
    is_ai = models.BooleanField(default=False)

class Game(models.Model):
    id =                  models.AutoField(primary_key=True)
    player1 =             models.ForeignKey(Participant, on_delete=models.CASCADE, related_name="games_as_player1")
    player2 =             models.ForeignKey(Participant, on_delete=models.CASCADE, related_name="games_as_player2")
    winner =              models.ForeignKey(Participant, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_won")
    score_player1 =       models.IntegerField(default=0)
    score_player2 =       models.IntegerField(default=0)
    longest_exchange =    models.IntegerField(default=0)
    created_at =          models.DateTimeField(auto_now_add=True)
    duration =            models.DurationField()
    tournament =          models.ForeignKey("Tournament", null=True, blank=True, on_delete=models.CASCADE, related_name="games")
    finished =            models.BooleanField(default=False)

class Tournament(models.Model):
    id =                    models.AutoField(primary_key=True)
    name =                  models.CharField(max_length=50)
    creator =               models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="tournaments_created")
    players =               models.ManyToManyField(Participant)
    winner =                models.ForeignKey(Participant, on_delete=models.CASCADE, related_name="winner_of_tournament")
    created_at =            models.DateTimeField(auto_now_add=True)
    finished =              models.BooleanField(default=False)
