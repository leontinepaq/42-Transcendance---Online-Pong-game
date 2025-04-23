from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from rest_framework.pagination import PageNumberPagination

from users.serializers import InvalidUserIDErrorSerializer, UserNotFoundErrorSerializer
from users.services import get_user_profile
from dashboards.services import get_user_stats, get_match_history
from .serializers import UserStatisticsSerializer, GameSerializer


#Display user stats by ID
@extend_schema(
    summary="Fetch user's stats identified by ID.",
    description="Fetch another user's gaming stats. User is identified by ID. If no ID provided, returns current user's stats",
    responses={400: InvalidUserIDErrorSerializer, 404: UserNotFoundErrorSerializer, 200: UserStatisticsSerializer},
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_user_stats(request):
    user_profile, error_response = get_user_profile(request)
    if error_response:
        return error_response

    stats = get_user_stats(user_profile)
    return Response(UserStatisticsSerializer(stats).data, status=200)


class MatchHistoryPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

#Display user match history by ID
@extend_schema(
    summary="Fetch user's match history identified by ID.",
    description="Fetch another user's match history. User is identified by ID. If no ID provided, returns current user's match history",
    responses={400: InvalidUserIDErrorSerializer, 404: UserNotFoundErrorSerializer, 200: GameSerializer},
    parameters=[OpenApiParameter(name="user_id", type=OpenApiTypes.INT, location=OpenApiParameter.QUERY)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_match_history(request):
    user_profile, error_response = get_user_profile(request)
    if error_response:
        return error_response

    games = get_match_history(user_profile)
    paginator = MatchHistoryPagination()
    result_page = paginator.paginate_queryset(games, request)
    return paginator.get_paginated_response(GameSerializer(result_page, many=True).data)
