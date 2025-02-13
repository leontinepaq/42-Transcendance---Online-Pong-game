from rest_framework import serializers
from rest_framework import status
from rest_framework.response import Response
from .models import Game, UserStatistics
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
            'duration']
        read_only_fields=['created_at', 'id']

    def create(self, validated_data):
        return Game.objects.create(**validated_data)

class UserStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserStatistics
        fields=[
            'user',
            'total_games_played',
            'wins',
            'losses',
            'games',
            'tournaments']
        read_only_fields=['user']
    
    def create(self, validated_data):
        #all of this because games is many to many field and we cant set it with create
        games = validated_data.pop('games', [])
        user_statistics = UserStatistics.objects.create(**validated_data)

        user_statistics.games.set(games)
        return user_statistics

class GenericResponseSerializer(serializers.Serializer):
    message=serializers.CharField(default="OK")

    def response(self, _status=200):
        return Response(self.data, status=_status)