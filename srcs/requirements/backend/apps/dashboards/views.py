from django.shortcuts import render
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserStatsSerializer

@extend_schema(
    summary="creates game",
    description="After game ends, creates game and adds it to both players's UserStatistics",
    responses={
        200: GenericResponseSerializer,
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

        player1_stats.games.add(game)
        player2_stats.games.add(game)

        player1_stats.save()
        player2_stats.save()

        return Response(GameSerializer(game).data, status=201)

    return Response({"message": "An error has occurred", "errors": serializer.errors}, status=400)

@extend_schema(
    summary="Fetch user statistics",
    description="Fetch user stats to display on frontend",
    responses=
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def UserStatisticsView(request):
    user = request.user
    try:
        user_stats = UserStatistics.objects.get(user=user)
    except UserStatistics.DoesNotExist:
        return GenericResponseSerializer({"message": "User Statistics not found"}).response(404)

    return Response(UserStatisticsSerializer(user_stats).data)