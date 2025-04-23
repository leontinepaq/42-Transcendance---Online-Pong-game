from users.models import UserProfile
from users.serializers import InvalidUserIDErrorSerializer, UserNotFoundErrorSerializer

def get_user_profile(request):
    """
    Récupère un profil utilisateur à partir de l'ID dans les paramètres de requête.
    Si aucun ID n'est fourni, retourne l'utilisateur authentifié.
    """
    user_id = request.query_params.get("user_id")
    if user_id:
        if not user_id.isdigit():
            return None, InvalidUserIDErrorSerializer().response(400)
        try:
            user_profile = UserProfile.objects.get(id=int(user_id))
            return user_profile, None
        except UserProfile.DoesNotExist:
            return None, UserNotFoundErrorSerializer().response(404)
    return request.user, None
