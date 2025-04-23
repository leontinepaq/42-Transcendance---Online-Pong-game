from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from drf_spectacular.utils import extend_schema
from dashboards.models import Tournament, Participant
from rest_framework.pagination import PageNumberPagination
from .serializers import (TournamentCreateSerializer,
                          DisplayTournamentSerializer,
                          TournamentSuccessResponseSerializer,
                          TournamentRegisterSerializer,
                          ApiResponse,
                          ErrorResponseSerializer)
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


@extend_schema(
    summary="Create a new tournament",
    description="Create a new tournament by providing tournament name",
    request=TournamentCreateSerializer,
    responses={
        201: TournamentSuccessResponseSerializer,
        400: ErrorResponseSerializer,
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create(request):
    serializer = TournamentCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return ApiResponse.error("Invalid name", status_code=400)

    name = serializer.validated_data["name"]
    creator_id = request.user.id

    try:
        tournament = Tournament.create_tournament(name, creator_id)
    except ValueError as e:
        return ApiResponse.error(str(e), status_code=400)

    response_data = TournamentSuccessResponseSerializer(tournament)
    return ApiResponse.success(response_data.data, status_code=201)


class TournamentPagination(PageNumberPagination):
    page_size = 3
    page_size_query_param = 'page_size'
    max_page_size = 20

def paginated_response(request, queryset, serializer_class):
    paginator = TournamentPagination()
    result_page = paginator.paginate_queryset(queryset, request)
    return paginator.get_paginated_response(serializer_class(result_page, many=True).data)

@extend_schema(
    summary="Display available tournaments",
    description="Display tournaments that are available for participation (less than 4 participants registered and user not registered).",
    responses={
        200: DisplayTournamentSerializer(many=True),
        400: ErrorResponseSerializer,
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_available(request):
    user = request.user
    participant = Participant.get(user.id)

    available_tournaments = Tournament.objects.filter(
        finished=False
    ).annotate(
        participant_count=Count('players')
    ).filter(
        participant_count__lt=4
    ).exclude(
        players=participant
    ).order_by('-created_at')
    return paginated_response(request, available_tournaments, DisplayTournamentSerializer)

@extend_schema(
    summary="Display registered tournaments",
    description="Display tournaments where the user is registered that are not started.",
    responses={
        200: DisplayTournamentSerializer(many=True),
        400: ErrorResponseSerializer,
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_registered(request):
    user = request.user
    participant = Participant.get(user.id)

    registered_tournaments = Tournament.objects.filter(
        finished=False
    ).annotate(
        participant_count=Count('players')
    ).filter(
        participant_count__lt=4,
        players=participant
    ).order_by('-created_at')
    return paginated_response(request, registered_tournaments, DisplayTournamentSerializer)


@extend_schema(
    summary="Display ongoing tournaments",
    description="Display tournaments where the user is registered that are started but not over.",
    responses={
        200: DisplayTournamentSerializer(many=True),
        400: ErrorResponseSerializer,
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_ongoing(request):
    user = request.user
    participant = Participant.get(user.id)

    ongoing_tournaments = Tournament.objects.filter(
        finished=False
    ).annotate(
        participant_count=Count('players')
    ).filter(
        players=participant,
        participant_count=4
    ).order_by('-created_at')
    return paginated_response(request, ongoing_tournaments, DisplayTournamentSerializer)

@extend_schema(
    summary="Display history of tournaments",
    description="Display tournaments where the user was registered that are over.",
    responses={
        200: DisplayTournamentSerializer(many=True),
        400: ErrorResponseSerializer,
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_history(request):
    user = request.user
    participant = Participant.get(user.id)

    history_tournaments = Tournament.objects.filter(
        finished=True,
        players=participant
    ).order_by('-created_at')
    return paginated_response(request, history_tournaments, DisplayTournamentSerializer)


@extend_schema(
    summary="Register for a tournament",
    description="Allows a user to register for a tournament, as long as the tournament is open and has less than 4 participants.",
    request=TournamentRegisterSerializer,
    responses={
        201: TournamentSuccessResponseSerializer,
        400: ErrorResponseSerializer,
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register(request):
    serializer = TournamentRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return ApiResponse.error("Invalid tournament ID", status_code=400)

    tournament_id = serializer.validated_data["tournament_id"]
    tournament = Tournament.objects.get(id=tournament_id)

    user = request.user
    participant = Participant.get(user.id)

    if tournament.players.filter(id=participant.id).exists():
        return ApiResponse.error("You are already registered for this tournament", status_code=400)

    if tournament.players.count() >= 4:
        return ApiResponse.error("This tournament already has 4 participants", status_code=400)

    tournament.players.add(participant)
    if tournament.players.count() == 4:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)("common_channel",
                                                {"type": "toggle.update"})

    response_data = TournamentSuccessResponseSerializer(tournament)
    return ApiResponse.success(response_data.data, status_code=201)


@extend_schema(
    summary="Unregister from a tournament",
    description="Unregister the current user from a tournament they are already registered to.",
    request=TournamentRegisterSerializer,
    responses={
        200: TournamentSuccessResponseSerializer,
        400: ErrorResponseSerializer,
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unregister(request):
    serializer = TournamentRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return ApiResponse.error("Invalid tournament ID", status_code=400)

    tournament_id = serializer.validated_data["tournament_id"]
    tournament = Tournament.objects.get(id=tournament_id)

    user = request.user
    participant = Participant.get(user.id)

    if not tournament.players.filter(id=participant.id).exists():
        return ApiResponse.error("You are not registered for this tournament", status_code=400)

    tournament.players.remove(participant)

    response_data = TournamentSuccessResponseSerializer(tournament)
    return ApiResponse.success(response_data.data, status_code=200)
