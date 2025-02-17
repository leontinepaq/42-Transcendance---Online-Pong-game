from django.urls import path
from .views import create_game, create_tournament, userStatisticsView, gameInfoView, tournamentInfoView

urlpatterns = [
    path("create-game/", create_game, name="create_game"),
    path("create-tournament/", create_tournament, name="create_tournament"),
    path("user-statistics/", create_game, name="user_statistics"),
    path("game-info/", gameInfoView, name="game_info"),
    path("create-game/", tournamentInfoView, name="tournament_info"),
]