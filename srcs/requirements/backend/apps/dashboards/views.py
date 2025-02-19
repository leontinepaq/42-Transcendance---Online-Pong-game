from django.shortcuts import render, get_object_or_404
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from users.models import UserProfile
from .models import Game, UserStatistics, Tournament
from .serializers import UserStatisticsSerializer, GameSerializer, TournamentSerializer
from users.serializers import GenericResponseSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

@extend_schema(
    summary="creates game",
    description="After game ends, creates game and adds it to both players's UserStatistics",
    request=GameSerializer,
    responses={
        201: GameSerializer,
        400: GenericResponseSerializer
    }
)
@api_view(["POST"])
def create_game(request):
    serializer = GameSerializer(data=request.data)
    if serializer.is_valid():
        game = serializer.save()

        player1_stats, _ = UserStatistics.objects.get_or_create(user=game.player1)
        player2_stats, _ = UserStatistics.objects.get_or_create(user=game.player2)

        player1_stats.total_games_played += 1
        player2_stats.total_games_played += 1

        if game.winner == game.player1:
            player1_stats.wins += 1
            player2_stats.losses += 1
        elif game.winner == game.player2:
            player2_stats.wins += 1
            player1_stats.losses += 1

        player1_stats.save()
        player2_stats.save()

        return Response(GameSerializer(game).data, status=201)

    return Response({"message": "An error has occurred", "errors": serializer.errors}, status=400)

@extend_schema(
    summary="Creates tournament to database",
    description="Creates tournament and adds all useful stats to players to database",
    request=TournamentSerializer,
    responses={
        201: TournamentSerializer,
        400: GenericResponseSerializer
    }
)
@api_view(["POST"])
def create_tournament(request):
    serializer = TournamentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"message": "An error has occurred", "errors": serializer.errors}, status=400)

    game_ids = request.data.get('games', [])
    if not game_ids:
        return GenericResponseSerializer({"message": "At least one game is required for a tournament"}, status=400)

    games = Game.objects.filter(id__in=game_ids).select_related('player1', 'player2')
    if len(games) != len(game_ids):
        return GenericResponseSerializer({"message": "One ore more game IDs are invalid"}, status=400)

    tournament = serializer.save()
    games.update(tournament=tournament)
    players = set(player for game in games.values_list("player1", "player2") for player in game)
    tournament.players.add(*players)

    return Response(TournamentSerializer(tournament).data, status=201)

@extend_schema(
    summary="Fetch user statistics",
    description="Fetch user stats to display on frontend",
    responses={
        404: GenericResponseSerializer,
        200: UserStatisticsSerializer
    },
    parameters=[
        OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)
    ],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def userStatisticsView(request):
    user_id = request.query_params.get("user_id")

    if not user_id or not user_id.isdigit():
        return GenericResponseSerializer({"message": "invalid or missing user id"}, status=400)

    user = get_object_or_404(UserProfile, id=int(user_id))

    try:
        user_stats = UserStatistics.objects.select_related('user').get(user=user)
    except UserStatistics.DoesNotExist:
        return GenericResponseSerializer({"message": "User Statistics not found"}).response(404)

    return Response(UserStatisticsSerializer(user_stats).data)

@extend_schema(
    summary="Fetch game info",
    description="Fetch game info to display on frontend",
    responses={
        404: GenericResponseSerializer,
        200: GameSerializer
    },
    parameters=[
        OpenApiParameter(name="game_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)
    ],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def gameInfoView(request):
    game_id = request.query_params.get("game_id")
    if not game_id:
        return GenericResponseSerializer({"message": "Game ID is required"}).response(400)

    game = get_object_or_404(Game.objects.select_related('player1', 'player2', 'winner', 'tournament'), id=game_id)
    return Response(GameSerializer(game).data, status=200)

@extend_schema(
    summary="Fetch tournament info",
    description="Fetch info stats to display on frontend",
    responses={
        404: GenericResponseSerializer,
        200: TournamentSerializer
    },
    parameters=[
        OpenApiParameter(name="tournament_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)
    ]
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tournamentInfoView(request):
    tournament_id = request.query_params.get("tournament_id")
    if not tournament_id:
        return GenericResponseSerializer({"message": "Tournament ID is required"}).response(400)

    tournament = get_object_or_404(Tournament.objects.prefetch_related('games', 'players'), id=tournament_id)
    return Response(TournamentSerializer(tournament).data, status=200)


