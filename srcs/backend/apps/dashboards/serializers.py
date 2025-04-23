from rest_framework import serializers
from django.db.models import Q
from django.conf import settings
from .models import Game, Participant, Tournament
from users.models import UserProfile

class ParticipantSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    class Meta:
        model = Participant
        fields = ['id', 'name', 'is_ai', 'avatar_url']
    def get_avatar_url(self, obj):
        if obj.is_ai:
            return settings.AI_AVATAR_URL  # Avatar spécifique pour les IA
        return obj.user.avatar_url if obj.user else None

class GameSerializer(serializers.ModelSerializer):
    player1 = ParticipantSerializer(read_only=True)
    player2 = ParticipantSerializer(read_only=True)
    winner = ParticipantSerializer(read_only=True, allow_null=True)
    duration = serializers.CharField(read_only=True)  # Conversion en string, puisque duration est un timedelta
    tournament = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Game
        fields = [
            'id',
            'player1',
            'player2',
            'winner',
            'score_player1',
            'score_player2',
            'longest_exchange',
            'created_at',
            'duration',
            'tournament',
            'finished'
        ]
        read_only_fields = ['created_at', 'id']

class TournamentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=50),
    games = GameSerializer(many=True, read_only=True)
    creator = ParticipantSerializer(read_only=True)
    players = ParticipantSerializer(many=True, read_only=True)

    class Meta:
        model=Tournament
        fields=[
            'id',
            'name',
            'creator',
            'players',
            'winner',
            'games',
            'created_at',
            'finished'
        ]
        read_only_fields=['created_at', 'id']

    def create(self, validated_data):
        players = validated_data.pop('players', [])
        tournament = Tournament.objects.create(**validated_data)
        tournament.players.set(players)
        return tournament

class UserStatisticsSerializer(serializers.Serializer):
    user = serializers.CharField()
    avatar_url = serializers.CharField()
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()
    winrate = serializers.FloatField()
    winstreak = serializers.IntegerField()
    total_time_played = serializers.CharField()
    solo_games = serializers.IntegerField()
    online_games = serializers.IntegerField()
    unique_opponents_count = serializers.IntegerField()
    daily_results = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )

class RequestCreateGameSerializer(serializers.Serializer):
    PLAYER_TYPES = ["ai", "guest", "user"]

    player1_type = serializers.ChoiceField(choices=PLAYER_TYPES)
    player1_id = serializers.IntegerField(required=False)
    player1_name = serializers.CharField(max_length=30, required=False)

    player2_type = serializers.ChoiceField(choices=PLAYER_TYPES)
    player2_id = serializers.IntegerField(required=False)
    player2_name = serializers.CharField(max_length=30, required=False)

    tournament_id = serializers.IntegerField(required=False)

    def validate(self, data):
        if data["player1_type"] == "user":
            if "player1_id" not in data:
                raise serializers.ValidationError("player1_id is required when player1_type is 'user'")
            if not UserProfile.objects.filter(id=data["player1_id"]).exists():
                raise serializers.ValidationError("Invalid player1_id")
        elif data["player1_type"] != "ai":
            if "player1_name" not in data or not data["player1_name"]:
                raise serializers.ValidationError("player1_name is required when player1_type is not 'ai'")

        if data["player2_type"] == "user":
            if "player2_id" not in data:
                raise serializers.ValidationError("player2_id is required when player2_type is 'user'")
            if not UserProfile.objects.filter(id=data["player2_id"]).exists():
                raise serializers.ValidationError("Invalid player2_id")
        elif data["player2_type"] != "ai":
            if "player2_name" not in data or not data["player2_name"]:
                raise serializers.ValidationError("player2_name is required when player2_type is not 'ai'")

        if "tournament_id" in data and not Tournament.objects.filter(id=data["tournament_id"]).exists():
            raise serializers.ValidationError("Invalid tournament_id")

        return data

class RequestCreateTournamentSerializer(serializers.Serializer):
    PLAYER_TYPES = ["ai", "guest", "user"]

    name = serializers.CharField(max_length=100)

    player2_type = serializers.ChoiceField(choices=PLAYER_TYPES)
    player2_id = serializers.IntegerField(required=False)
    player2_name = serializers.CharField(max_length=30, required=False)

    player3_type = serializers.ChoiceField(choices=PLAYER_TYPES)
    player3_id = serializers.IntegerField(required=False)
    player3_name = serializers.CharField(max_length=30, required=False)

    player4_type = serializers.ChoiceField(choices=PLAYER_TYPES)
    player4_id = serializers.IntegerField(required=False)
    player4_name = serializers.CharField(max_length=30, required=False)

    def validate_player(self, player_type, player_id, player_name):
        if player_type == "user":
            if not player_id:
                raise serializers.ValidationError(f"{player_type}_id is required when player type is 'user'")
            if not UserProfile.objects.filter(id=player_id).exists():
                raise serializers.ValidationError(f"Invalid {player_type}_id")
        elif player_type != "ai":
            if not player_name:
                raise serializers.ValidationError(f"{player_type}_name is required when player type is not 'ai'")

    def validate(self, data):
        self.validate_player(data["player2_type"], data.get("player2_id"), data.get("player2_name"))
        self.validate_player(data["player3_type"], data.get("player3_id"), data.get("player3_name"))
        self.validate_player(data["player4_type"], data.get("player4_id"), data.get("player4_name"))
        return data
