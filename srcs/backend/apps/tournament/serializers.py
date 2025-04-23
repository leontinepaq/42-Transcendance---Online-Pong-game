from rest_framework import serializers
from dashboards.models import Tournament
from dashboards.serializers import ParticipantSerializer, GameSerializer

class TournamentCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)

class TournamentSuccessResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()

class DisplayTournamentSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source="creator.username")
    creator_avatar = serializers.CharField(source="creator.avatar_url")
    participants = serializers.SerializerMethodField()
    winner = ParticipantSerializer(read_only=True)
    games = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'created_at', 'creator_username', 'creator_avatar', 
                  'participants', 'winner', 'games']

    def get_participants(self, obj):
        # Récupérer les 4 premiers participants du tournoi
        participants = obj.players.all()[:4]  # Limité à 4 participants maximum
        return ParticipantSerializer(participants, many=True).data

    def get_games(self, obj):
        # games = obj.games.all().order_by('created_at')  # ou .filter(tournament=obj)
        games = obj.get_next_match()
        return GameSerializer(games, many=True).data

class TournamentRegisterSerializer(serializers.Serializer):
    tournament_id = serializers.IntegerField()

    def validate_tournament_id(self, value):
        try:
            tournament = Tournament.objects.get(id=value)
        except Tournament.DoesNotExist:
            raise serializers.ValidationError("Tournament not found.")
        if tournament.finished:
            raise serializers.ValidationError("Tournament has already finished.")
        return value

# @leontinepaq : pourrait etre dans un dir commun

from rest_framework.response import Response
from rest_framework import status


class ErrorResponseSerializer(serializers.Serializer):
    details = serializers.CharField()


class ApiResponse:
    @staticmethod
    def success(data=None, status_code=status.HTTP_200_OK, message="Success"):
        response_data = {
            "details": message,
            "data": data or {}
        }
        return Response(response_data, status=status_code)

    @staticmethod
    def error(error_message, status_code=status.HTTP_400_BAD_REQUEST):
        response_data = {
            "details": error_message,
        }
        return Response(response_data, status=status_code)
