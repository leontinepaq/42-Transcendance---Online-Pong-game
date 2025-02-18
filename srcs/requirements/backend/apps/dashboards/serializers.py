from rest_framework import serializers
from django.db.models import Q
from rest_framework import status
from rest_framework.response import Response
from .models import Game, UserStatistics, Tournament
from users.models import UserProfile

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model=Game
        fields=[
            'id',
            'player1',
            'player2',
            'winner',
            'score_player1',
            'score_player2',
            'longest_exchange',
            'created_at',
            'duration',
            'tournament']
        read_only_fields=['created_at', 'id']

class TournamentSerializer(serializers.ModelSerializer):
    games = GameSerializer(many=True, read_only=True)

    class Meta:
        model=Tournament
        fields=[
            'id',
            'name',
            'players',
            'winner',
            'games',
            'created_at'
        ]
        read_only_fields=['created_at', 'id']

        def create(self, validated_data):
            players = validated_data.pop('players', [])
            tournament = Tournament.objects.create(**validated_data)
            tournament.players.set(players)
            return tournament

class UserStatisticsSerializer(serializers.ModelSerializer):
    games = serializers.SerializerMethodField()
    tournaments = serializers.SerializerMethodField()
    winrate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = UserStatistics
        fields = [
            'user',
            'total_games_played',
            'wins',
            'losses',
            'winrate',
            'games',
            'tournaments'
        ]
        read_only_fields = ['user', 'winrate']
    
    def get_games(self, obj):
        games = Game.objects.filter(
            Q(player1=obj.user) | Q(player2=obj.user)
        ).select_related('player1', 'player2', 'winner', 'tournament')
        return GameSerializer(games, many=True).data
    
    def get_tournaments(self, obj):
        tournaments = Tournament.objects.filter(
            players=obj.user
        ).prefetch_related('games', 'players')
        return TournamentSerializer(tournaments, many=True).data
