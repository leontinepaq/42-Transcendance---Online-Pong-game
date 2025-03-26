from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from users.models import UserProfile
from dashboards.services import get_user_stats
from users.serializers import (InvalidUserIDErrorSerializer, UserNotFoundErrorSerializer)
from .serializers import (UserStatisticsSerializer)

#Display user stats by ID
@extend_schema(
    summary="Fetch user's stats identified by ID.",
    description="Fetch another user's gaming stats. User is identified by ID. If no ID provided, returns current user's stats",
    responses={ 400: InvalidUserIDErrorSerializer,
                404: UserNotFoundErrorSerializer,
                200: UserStatisticsSerializer},
    parameters=[OpenApiParameter(name="user_id",
                                 type=OpenApiTypes.INT,
                                 location=OpenApiParameter.QUERY)],
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def display_user_stats(request):
    user_id = request.query_params.get("user_id")
    if user_id: # todo @leontinepaq voir si ca pourrait pas etre gere dans une fonction de users/userprofile ..?
        if not user_id.isdigit():
            return InvalidUserIDErrorSerializer().response(400)
        try:
            user_profile = UserProfile.objects.get(id=int(user_id))
        except UserProfile.DoesNotExist:
            return UserNotFoundErrorSerializer().response(404)
    else:
        user_profile = request.user

    stats = get_user_stats(user_profile)
    stats_data = UserStatisticsSerializer(stats).data

    return Response(stats_data, status=200)

