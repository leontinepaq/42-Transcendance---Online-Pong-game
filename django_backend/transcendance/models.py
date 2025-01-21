from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

#think about on_delete=SET_NULL instead of CASCADE. See https://stackoverflow.com/questions/38388423/what-does-on-delete-do-on-django-models

class UserProfileManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not username:
            raise ValueError('Username is required')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(username, email, password, **extra_fields)

class UserProfile(AbstractBaseUser, PermissionsMixin):
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(unique=True)

    avatar_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    theme = models.CharField(
        max_length=5,
        choices=[("light", "Light"), ("dark", "Dark")],
        default="light",
    )

    objects = UserProfileManager()

    def __str__(self):
        return self.username

class Friendship(models.Model):
	class Meta:
		unique_together = ('user', 'friend')
		index = [
			models.Index(fields=['user', 'friend']),
			models.Index(fields=['status'])
		]

    user = models.ForeignKey(UserProfile, related_name='friendships', on_delete=models.CASCADE)
    friend = models.ForeignKey(UserProfile, related_name='friend_of_friendships', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} -> {self.friend.username} ({self.status})'


#if multiple games implemented : create Game Class with id, game type, created at. Create Game_session class exactly like Game + game = ForeignKey(game).

class Game(models.Model):
	status = models.CharField(
		max_length=20,
		choices=[
		('pending', 'Pending'),
		('in_progress', 'In Progress'),
		('completed', 'Completed'),
		],
		default='pending'
	)

    player1 = models.ForeignKey(UserProfile, related_name='player1_session', on_delete=models.CASCADE)
    player2 = models.ForeignKe39y(UserProfile, related_name='player2_session', on_delete=models.CASCADE)
    score_player1 = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    score_player2 = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    winner = models.ForeignKey(UserProfile, related_name='won_session', on_delete=models.CASCADE)
	status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.player1.username} vs {self.player2.username} ({self.winner.username if self.winner else "TBD"})'

	@classmethod
	def create_game(cls, player1, player2):
		return cls.objects.create(player1=player1, player2=player2)

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
	organizer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='organized_tournament')
    participants = models.ManyToManyField(UserProfile, related_name='tournaments', blank=True)
	local_players = models.ManyToManyField('LocalPlayer', related_name='tournaments', blank=True)
    games = models.ForeignKey(Game, related_name='tournaments', on_delete=models.CASCADE, null=True, blank=True)
    winner = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_tournaments')
    date = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed')
        ],
        default='pending'
    )

	def __str__(self):
		return f'Tournament {self.id} - {self.status}'

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

#MaybeToModify ?
class LocalPlayer(models.Model):
    name = models.CharField(max_length=100)
    tournament = models.ForeignKey('Tournament', related_name='local_players', on_delete=models.CASCADE)

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


@receiver(post_save, sender=Game)
def update_player_statistics(sender, instance, created, **kwargs):
    if created:  # Only update when a new match is created
        # Update player statistics for both players
        player1_stats, created1 = PlayerStatistics.objects.get_or_create(user=instance.player1)
        player2_stats, created2 = PlayerStatistics.objects.get_or_create(user=instance.player2)
        
        player1_stats.games_played += 1
        player2_stats.games_played += 1
        
        if instance.winner == instance.player1:
            player1_stats.games_won += 1
        elif instance.winner == instance.player2:
            player2_stats.games_won += 1

        player1_stats.save()
        player2_stats.save()

        # Update the match history for both players
        MatchHistory.objects.create(user=instance.player1, game_session=instance)
        MatchHistory.objects.create(user=instance.player2, game_session=instance)

@receiver(post_save, sender=Tournament)
def update_tournament_winner(sender, instance, created, **kwargs):
    if created:  # Only update when a new tournament is created
        # Add to the participant statistics
        for player in instance.participants.all():
            player_stats, created = PlayerStatistics.objects.get_or_create(user=player)
            player_stats.tournaments_played += 1
            if player == instance.winner:
                player_stats.tournaments_won += 1
            player_stats.save()

class AllTimeStatistics(models.Model): #A modifier ? https://claude.ai/chat/6aa88d28-3db8-4838-8e13-c0479bae8d99
    total_users = models.IntegerField(default=0)
    total_matches = models.IntegerField(default=0)
    total_tournaments = models.IntegerField(default=0)
    total_points_scored = models.IntegerField(default=0)
    active_users_last_month = models.IntegerField(default=0)

    def update_stats(self):
        self.total_users = UserProfile.objects.count()
        self.total_matches = Game.objects.count()
        self.total_tournaments = Tournament.objects.count()
        self.total_points_scored = Game.objects.aggregate(models.Sum('score_player1'))['score_player1__sum'] + \
                                  Game.objects.aggregate(models.Sum('score_player2'))['score_player2__sum']
        self.save()

    def __str__(self):
        return f"Users: {self.total_users}, Matches: {self.total_matches}, Tournaments: {self.total_tournaments}, Points Scored: {self.total_points_scored}"

@receiver(post_save, sender=Game)
def update_all_time_statistics(sender, instance, created, **kwargs):
    if created:
        all_time_stats, created = AllTimeStatistics.objects.get_or_create(id=1)  # Assuming there’s only one record
        all_time_stats.update_stats()
