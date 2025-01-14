from django.db import models

#think about on_delete=SET_NULL instead of CASCADE. See https://stackoverflow.com/questions/38388423/what-does-on-delete-do-on-django-models


class UserProfile(models.Model):
    id = models.AutoField(primary_key=True)

    username = models.CharField(max_length=30, unique=True)
    password_hash = models.CharField(max_length=255)

    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True, null=True)

    created_at =models.DateTimeField(auto_now_add=True)
    updated_at =models.DateTimeField(auto_now=True)

    friends = models.ManyToManyField("self", blank=True, symmetrical=False, related_name="friend_of")

    friends_requests_sent = models.ManyToManyField("self", blank=True)

    def __str__(self):
        return self.username


class Friendship(models.Model):
    user = models.ForeignKey(UserProfile, related_name='friendships', on_delete=models.CASCADE)
    friend = models.ForeignKey(UserProfile, related_name='friend_of_friendships', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} -> {self.friend.username} ({self.status})'


#if multiple games implemented : create Game Class with id, game type, created at. Create Game_session class exactly like Game + game = ForeignKey(game).

class Game(models.Model):
    player1 = models.ForeignKey(UserProfile, related_name='player1_session', on_delete=models.CASCADE)
    player2 = models.ForeignKey(UserProfile, related_name='player2_session', on_delete=models.CASCADE)
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)
    winner = models.ForeignKey(UserProfile, related_name='won_session', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.player1.username} vs {self.player2.username} ({self.winner.username if self.winner else "TBD"})'

class MatchHistory(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    game_session = models.ForeignKey(Game, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} played in session {self.game_session}'

class PlayerStatistics(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    tournaments_played = models.IntegerField(default=0)
    tournaments_won = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    
    @property
    def winrate(self):
        if self.games_played == 0:
            return 0
        return round((self.games_won / self.games_played) * 100, 2)

    def __str__(self):
        return f'{self.user.username}: {self.games_played} games, {self.games_won} wins, {self.winrate}% winrate'

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    id = models.AutoField(primary_key=True)
    participants = models.ManyToManyField(UserProfile, related_name='tournaments', blank=True)
    games = models.ForeignKey(Game, related_name='tournaments', on_delete=models.CASCADE)
    winner = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_tournaments')

    def get_rankings(self):
        players = list(self.participants.all())
        if len(players) != 4:
            raise ValueError("Tournament must have exactly 4 participants.")

        rankings = {}
        round_1_winners = []

        for i in range(0, 4, 2):
            player1, player2 = players[i], players[i + 1]
            winner, loser = self.determine_match_result(player1, player2)
            if winner and loser:
                round_1_winners.append(winner)
                rankings[loser] = 4
            else:
                return "TBD"
        
        final_winner, final_loser = self.determine_match_result(round_1_winners[0], round_1_winners[1])
        if final_winner and final_loser:
            rankings[final_loser] = 2
            rankings[final_winner] = 1
            self.winner = final_winner
            self.save()
        else:
            return "TBD"

        return rankings

    def determine_match_result(self, player1, player2):
        game = self.games.filter(player1=player1, player2=player2).first()
        if not game:
            return None, None
        
        if game.winner:
            winner = game.winner
            loser = player1 if winner == player2 else player2
            return winner, loser
        else:
            return None, None


#change Group in return ? 
class Message(models.Model):
    sender = models.ForeignKey(UserProfile, related_name="sent_messages", on_delete=models.CASCADE)
    receiver = models.ForeignKey(UserProfile, related_name = "received_messages", on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return  f'{self.sender.username} to {self.receiver.username if self.receiver else "Group"}'


#only email instead of method ? 
class TwoFactorAuth(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    method = models.CharField(max_length=20)
    secret_key = models.CharField(max_length=255)

    def __str__(self):
        return f'{self.user.username} - 2FA ({self.method})'


class Customization(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    preferences = models.JSONField()

    def __str__(self):
        return f'{self.user.username} preferences'

    