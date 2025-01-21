from rest_framework import serializers
from .models import (
    UserProfile, Friendship, Game, MatchHistory,
    PlayerStatistics, Tournament, Message,
    TwoFactorAuth, Customization, AllTimeStatistics
)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'avatar_url', 'theme', 
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'id']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

class FriendshipSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    friend_details = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ['id', 'user', 'friend', 'status', 'created_at', 
                 'user_details', 'friend_details']
        read_only_fields = ['created_at']

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'avatar_url': obj.user.avatar_url
        }

    def get_friend_details(self, obj):
        return {
            'id': obj.friend.id,
            'username': obj.friend.username,
            'avatar_url': obj.friend.avatar_url
        }

class GameSerializer(serializers.ModelSerializer):
    player1_details = serializers.SerializerMethodField()
    player2_details = serializers.SerializerMethodField()
    winner_details = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = ['id', 'player1', 'player2', 'score_player1', 'score_player2',
                 'winner', 'created_at', 'player1_details', 'player2_details',
                 'winner_details']
        read_only_fields = ['created_at']

    def get_player1_details(self, obj):
        return {'username': obj.player1.username, 'id': obj.player1.id}

    def get_player2_details(self, obj):
        return {'username': obj.player2.username, 'id': obj.player2.id}

    def get_winner_details(self, obj):
        if obj.winner:
            return {'username': obj.winner.username, 'id': obj.winner.id}
        return None

class MatchHistorySerializer(serializers.ModelSerializer):
    game_details = GameSerializer(source='game_session', read_only=True)
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = MatchHistory
        fields = ['id', 'user', 'game_session', 'date', 'game_details', 'user_details']
        read_only_fields = ['date']

    def get_user_details(self, obj):
        return {'username': obj.user.username, 'id': obj.user.id}

class PlayerStatisticsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    winrate = serializers.FloatField(read_only=True)

    class Meta:
        model = PlayerStatistics
        fields = ['id', 'user', 'username', 'games_played', 'games_won',
                 'tournaments_played', 'tournaments_won', 'winrate']
        read_only_fields = ['games_played', 'games_won', 'tournaments_played', 
                           'tournaments_won']

class TournamentSerializer(serializers.ModelSerializer):
    participants_details = serializers.SerializerMethodField()
    winner_details = serializers.SerializerMethodField()
    games_details = GameSerializer(source='games', read_only=True)

    class Meta:
        model = Tournament
        fields = ['id', 'organizer', 'name', 'participants', 'games', 'winner', 'date',
                 'status', 'participants_details', 'winner_details', 'games_details']
        read_only_fields = ['date']

    def get_participants_details(self, obj):
        return [{'id': user.id, 'username': user.username} 
                for user in obj.participants.all()]

    def get_winner_details(self, obj):
        if obj.winner:
            return {'id': obj.winner.id, 'username': obj.winner.username}
        return None

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'message', 'created_at',
                 'sender_username', 'receiver_username']
        read_only_fields = ['created_at']

class TwoFactorAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = TwoFactorAuth
        fields = ['id', 'user', 'method']
        extra_kwargs = {
            'secret_key': {'write_only': True}
        }

class CustomizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customization
        fields = ['id', 'user', 'preferences']

class AllTimeStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AllTimeStatistics
        fields = ['total_users', 'total_matches', 'total_tournaments',
                 'total_points_scored', 'active_users_last_month']
        read_only_fields = fields  #All fields are read-only bc they're updated by signals