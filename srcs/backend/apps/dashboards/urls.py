from django.urls import path
from .views import display_user_stats, display_match_history
# , display_all_users_stats, display_user_games, display_user_tournaments, display_game, display_tournament, create_game, create_tournament

urlpatterns = [
    path("display-user-stats/", display_user_stats, name="display_user_statistics"),
	path("match-history/", display_match_history, name="match_history"),
#     path('display-all-users-stats/', display_all_users_stats, name="display_all_users_stats"),
#     path("display-user-games/", display_user_games, name="display_user_games"),
#     path("display-user-tournaments/", display_user_tournaments, name="display_user_tournaments"),
#     path("display-game/", display_game, name="display_game"),
#     path("display-tournaments/", display_tournament, name="display_tournaments"),
#     path("create-game/", create_game, name="create_game"),
#     path("create-tournament/", create_tournament, name="create_tournament"),
]
