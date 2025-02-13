# from django.db import models
# from users.models import UserProfile

class Game(models.Model):
    id =                  models.AutoField(primary_key=True)
    player1 =             models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="games_as_player1")
    player2 =             models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="games_as_player2")
    #user.games_won.all() on database
    winner =              models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_won")
    score_player1 =       models.IntegerField(default=0)
    score_player2 =       models.IntegerField(default=0)
    longest_exchange =    models.IntegerField(default=0)
    created_at =          models.DateTimeField(auto_now_add=True)
    duration =            models.DurationField()
    tournament =          models.ForeignKey("Tournament", null=True, blank=True, on_delete=models.CASCADE, related_name="games_in_tournament")

class UserStatistics(models.Model):
    user =                  models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    total_games_played =    models.IntegerField(default=0)
    wins =                  models.IntegerField(default=0)
    losses =                models.IntegerField(default=0)
    games =                 models.ManyToManyField(Game, blank=True)
    tournaments =           models.ManyToManyField("Tournament", blank=True)

    @property
    def winrate(self):
        if self.total_games_played == 0:
            return 0
        return (self.wins / self.total_games_played) * 100

class Tournament(models.Model):
    id =                    models.AutoField(primary_key=True)
    name =                  models.CharField(max_length=50)
    players =               models.ManyToManyField(UserProfile)
    winner =                models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="winner_of_tournament")
    games =                 models.ManyToManyField(Game, related_name="tournaments")
    created_at =            models.DateTimeField(auto_now_add=True)

