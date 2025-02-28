from django.shortcuts import render, get_object_or_404
from datetime import timedelta
from django.db.models import Q
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from users.models import UserProfile
from .models import Game, Tournament, Participant
from .serializers import (GameSerializer, TournamentSerializer, 
    UserStatisticsSerializer, ParticipantSerializer, RequestCreateGameSerializer, RequestCreateTournamentSerializer)
from users.serializers import GenericResponseSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

#Display user stats by ID
@extend_schema(
    summary="Fetch user's stats identified by ID.",
    description="Fetch all user's gaming stats. User is identified by ID. If no ID provided, returns current user's stats",
    responses={
        404: GenericResponseSerializer,
        200: UserStatisticsSerializer
    },
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_user_stats(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        user_profile = request.user
    else:
        try:
            user_profile = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            user_profile = None
    
    if not user_profile:
        return Response({"details": "User not found"}, status=404)

    stats = get_user_stats(user_profile)
    if stats is None:
        return Response({"details": "User not found"}, status=404)

    return Response(UserStatisticsSerializer(stats).data, status=200)

#Display all users stats
@extend_schema(
    summary="Displays all users statistics",
    description="Go fetch all users in the database and returns their gaming statistics",
    responses={
        404: GenericResponseSerializer,
        200: UserStatisticsSerializer(many=True)
    },
)
@api_view(["GET"])
def display_all_users_stats(request):
    all_users = UserProfile.objects.all()
    stats_list = [get_user_stats(user) for user in all_users if get_user_stats(user) is not None]

    return Response(UserStatisticsSerializer(stats_list, many=True).data, status=200)

#helper function to fetch user statistics
def get_user_stats(user_profile):
    # participant = get_object_or_404(Participant, user=user_profile)
    try:
        participant = Participant.objects.get(user=user_profile)
    except Participant.DoesNotExist:
        participant = None

    if not participant:
        return {
        "user": user_profile.username,
        "total_games_played": 0,
        "wins": 0,
        "losses": 0,
        "winrate": 0.0,
        "winstreak": 0,
        "total_time_played": timedelta(seconds=0),
        "solo_games": 0,
        "multiplayer_games": 0,
        "online_games": 0,
        "unique_opponents_count": 0,
        "games": [],
        "tournaments": [],
    }

    games = Game.objects.filter(Q(player1=participant) | Q(player2=participant))
    total_games_played = games.count()
    wins = games.filter(winner=participant).count()
    losses = total_games_played - wins
    winrate = (wins / total_games_played) * 100 if total_games_played > 0 else 0
    total_time_played = sum((game.duration for game in games if game.duration is not None), timedelta())

    solo_games = 0
    multiplayer_games = 0
    online_games = 0
    for game in games:
        if game.player2.is_ai:
            solo_games += 1
        elif game.player2.user is None:
            multiplayer_games += 1
        else:
            online_games += 1

    winstreak = 0
    for game in reversed(games):
        if game.winner and game.winner.user == user_profile:
            winstreak += 1
        else:
            break

    unique_opponents = set()
    for game in games:
        opponent = game.player2 if game.player1.user == user_profile else game.player1
        if opponent.user != None:
            unique_opponents.add(opponent.user)
    unique_opponents_count = len(unique_opponents)

    tournaments = Tournament.objects.filter(players=participant)
    return {
        "user": user_profile.username,
        "total_games_played": total_games_played,
        "wins": wins,
        "losses": losses,
        "winrate": round(winrate, 2),
        "winstreak": winstreak,
        "total_time_played": total_time_played,
        "solo_games": solo_games,
        "multiplayer_games": multiplayer_games,
        "online_games": online_games,
        "unique_opponents_count": unique_opponents_count,
        "games": games,
        "tournaments": tournaments,
    }

#Display all user games
@extend_schema(
    summary="View all played games by user identified by ID",
    description="Fetch all games played by user identified by ID. If no ID in request, sends all games played by current user",
    responses={
        404: GenericResponseSerializer,
        200: GameSerializer(many=True),
    },
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_user_games(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        user = request.user
    else:
        try:
            user = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            user = None

    if not user:
        return Response({"details": "User not found"}, status=404)

    try:
        participant = Participant.objects.get(user=user)
    except Participant.DoesNotExist:
        participant = None

    if not participant:
        return Response([], status=200)

    games = Game.objects.filter(Q(player1=participant) | Q(player2=participant)).select_related("player1", "player2", "winner")
    return Response(GameSerializer(games, many=True).data, status=200)

#Display all user tournaments
@extend_schema(
    summary="View all tournament played by user identified by ID",
    description="Fetch all tournaments played by user identified by ID. If no ID in request, sends all tournaments played by current user",
    responses={
        404: GenericResponseSerializer,
        200: TournamentSerializer(many=True),
    },
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_user_tournaments(request):
    user_id = request.query_params.get("user_id")
    if not user_id:
        user = request.user
    else:
        try:
            user = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            user = None

    if not user:
        return Response({"details": "User not found"}, status=404)

    try:
        participant = Participant.objects.get(user=user)
    except Participant.DoesNotExist:
        participant = None

    if not participant:
        return Response([], status=200)

    tournaments = Tournament.objects.filter(players=participant).prefetch_related("players", "games", "winner")
    return Response(TournamentSerializer(tournaments, many=True).data, status=200)

#Display one specific game by ID
@extend_schema(
    summary="Fetch one game info identified by ID",
    description="Fetch game info to display on frontend. Must provide game ID",
    responses={
        404: GenericResponseSerializer,
        200: GameSerializer,
    },
    parameters=[OpenApiParameter(name="game_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_game(request):
    game_id = request.query_params.get("game_id")
    if not game_id:
        return GenericResponseSerializer({"details": "Game ID is required"}).response(400)

    game = get_object_or_404(Game.objects.select_related('player1', 'player2', 'winner', 'tournament'), id=game_id)
    return Response(GameSerializer(game).data, status=200)

#Display one specific tournament by ID
@extend_schema(
    summary="Fetch one tournament info identified by ID",
    description="Fetch info stats to display on frontend. Must provide tournament ID",
    responses={
        404: GenericResponseSerializer,
        200: TournamentSerializer
    },
    parameters=[OpenApiParameter(name="tournament_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=True)]
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_tournament(request):
    tournament_id = request.query_params.get("tournament_id")
    if not tournament_id:
        return GenericResponseSerializer({"details": "Tournament ID is required"}).response(400)

    tournament = get_object_or_404(Tournament.objects.prefetch_related('games', 'players'), id=tournament_id)
    return Response(TournamentSerializer(tournament).data, status=200)

#Create game
@extend_schema(
    summary="Create a game",
    description="Creates a game, saves its participants and ID and returns it. Needs player1_type (= ai, guest or user), player1_id if player1 is a user, player1_name if player1 is not AI. Same for player2.",
    responses={
        201: GenericResponseSerializer,
        400: GenericResponseSerializer,
        404: GenericResponseSerializer,
    },
    request=RequestCreateGameSerializer,
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_game(request):
    user = request.user

    player1 = create_participant(request.data.get("player1_type"), request.data.get("player1_id"), request.data.get("player1_name"))
    if isinstance(player1, Response): #If create_participant fails, player1 is an error response. We return this response.
        return player1

    player2 = create_participant(request.data.get("player2_type"), request.data.get("player2_id"), request.data.get("player2_name"))
    if isinstance(player2, Response):
        return player2

    if player2.is_ai == False and player1.is_ai == False and player2.name == player1.name:
        return Response({"error": "Player names must be different"}, status=400)

    tournament_id = request.data.get("tournament_id")
    tournament = None
    if tournament_id:
        try:
            tournament = Tournament.objects.get(id=tournament_id)
        except Tournament.DoesNotExist:
            return Response({"error": "Invalid tournament_id"}, status=404)

    if tournament != None:
        game = Game.objects.create(player1=player1, player2=player2, tournament=tournament)
    else:
        game = Game.objects.create(player1=player1, player2=player2)

    return Response(GameSerializer(game).data, status=201)

#Create tournament
@extend_schema(
    summary="Creates a tournament",
    description="Creates a tournament, saves its participants, creator and ID and returns it. Needs player1_type (= ai, guest or user), player1_id if player1 is a user, player1_name if player1 is not AI. Same for all players.",
    responses={
        201: TournamentSerializer
    },
    request=RequestCreateTournamentSerializer
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_tournament(request):
    user = request.user

    player1 = create_participant("user", player_id=user.id)
    if isinstance(player1, Response):
        return player2

    player2 = create_participant(request.data.get("player2_type"), request.data.get("player2_id"), request.data.get("player2_name"))
    if isinstance(player2, Response):
        return player2

    player3 = create_participant(request.data.get("player3_type"), request.data.get("player3_id"), request.data.get("player3_name"))
    if isinstance(player3, Response):
        return player3

    player4 = create_participant(request.data.get("player4_type"), request.data.get("player4_id"), request.data.get("player4_name"))
    if isinstance(player4, Response):
        return player4

    name = request.data.get("name")
    if not name:
        return Response({"error": "Tournament name is required"}, status=400)

    players = [
        (player1, "user"),
        (player2, request.data.get("player2_type")),
        (player3, request.data.get("player3_type")),
        (player4, request.data.get("player4_type"))
    ]

    human_players = [player for player, player_type in players if player_type in ["user", "guest"]]
    human_player_names = [player.name for player in human_players]
    duplicate_names = [name for name in human_player_names if human_player_names.count(name) > 1]
    
    if duplicate_names:
        return Response({"error": f"Duplicate player names found: {', '.join(set(duplicate_names))}"}, status=400)


    tournament = Tournament.objects.create(name=name, creator=user)
    tournament.players.add(player1, player2, player3, player4)

    return Response(TournamentSerializer(tournament).data, status=201)

#utils to create participants
def create_participant(player_type, player_id=None, player_name=None):
    """
    Creates or retrieves a Participant based on its type.
    
    - **user**: Uses an existing UserProfile.
    - **guest**: Creates a guest participant by name.
    - **ai**: Uses a predefined AI participant.
    
    Returns:
    - `Participant` object if successful.
    - `Response` (error) if invalid data is provided.
    """

    if player_type == "user":
        if not player_id:
            return Response({"error": f"player_id is required for user type"}, status=400)
        try:
            user_profile = UserProfile.objects.get(id=player_id)
            participant, _ = Participant.objects.get_or_create(user=user_profile, defaults={"name": user_profile.username, "is_ai": False})
        except UserProfile.DoesNotExist:
            return Response({"error": f"Invalid user ID {player_id}"}, status=400)

    elif player_type == "guest":
        if not player_name:
            return Response({"error": "Guest player must have a name"}, status=400)
        participant, _ = Participant.objects.get_or_create(name=player_name, is_ai=False)

        if UserProfile.objects.filter(username=player_name).exists():
            return Response({"error": f"Username '{player_name}' is already taken by another user."}, status=400)

    elif player_type == "ai":
        participant, _ = Participant.objects.get_or_create(name="CPU", is_ai=True)

    else:
        return Response({"error": f"Invalid player type '{player_type}'"}, status=400)

    return participant
