# from django.db import models
# from users.models import UserProfile

# class Game(models.Model):
#     player1 =             models.ForeignKey(UserProfile, on_delete=models.CASCADE)
#     # player2 =             models.ForeignKey(UserProfile, on_delete=models.CASCADE)
#     #user.games_won.all() on database
#     winner =              models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="games_won")
#     score_player1 =       models.IntegerField(default=0)
#     score_player2 =       models.IntegerField(default=0)
#     longest_exchange =    models.IntegerField(default=0)
#     created_at =          models.DateTimeField(auto_now_add=True)
#     duration =            models.DurationField()
#     # tournament =          models.ForeignKey(Tournament, blank=True, on_delete=models.CASCADE)

# class UserStatistics(models.Model):
#     user =                  models.OneToOneField(UserProfile, on_delete=models.CASCADE)
#     total_games_played =    models.IntegerField(default=0)
#     wins =                  models.IntegerField(default=0)
#     losses =                models.IntegerField(default=0)
#     games =                 models.ManyToManyField(Game, blank=True)
#     # tournaments =           models.ManyToManyField(Tournament, blank=True)

# # class Tournament(models.Model):
# #     players =               models.ManyToManyField(UserProfile)
# #     winner =                models.ForeignKey(UserProfile, on_delete=models.CASCADE)

#     @property
#     def winrate(self):
#         if self.total_games_played == 0:
#             return 0
#         return (self.wins / self.total_games_played) * 100
