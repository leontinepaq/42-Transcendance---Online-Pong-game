from django.urls import path
from transcendance import views

app_name = 'transcendance'

urlpatterns = [
    # Auth
    path('auth/signup/', views.signup, name='signup'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/verify-2fa/', views.verify_2fa, name='verify_2fa'),
    path('auth/logout/', views.sign_out, name='logout'),
    
    # Game
    path('games/', views.game_view, name='games'),
    path('games/invite/', views.create_game_invitation, name='create_game_invitation'),
    path('games/<int:game_id>/accept/', views.accept_game_invitation, name='accept_game_invitation'),
    path('games/friends/', views.friends_list, name='friends_list'),
    
    # Tournament
    path('tournaments/', views.tournament_view, name='tournaments'),
    path('tournaments/create/', views.create_tournament_view, name='create_tournament'),
    path('tournaments/<int:tournament_id>/invite/', views.invite_to_tournament, name='invite_to_tournament'),
    path('tournaments/<int:tournament_id>/accept/', views.accept_tournament_invitation, name='accept_tournament_invitation'),
    path('tournaments/<int:tournament_id>/launch/', views.launch_tournament, name='launch_tournament'),
    
    # History
    path('history/', views.history_view, name='history'),
    
    # Profile
    path('profile/', views.profile_view, name='profile'),
    path('profile/<int:friend_id>/', views.friend_profile, name='friend_profile'),
    path('friends/<int:friend_id>/', views.manage_friend, name='manage_friend'),

	# Update
	path('update-password/', views.update_password, name='update-password'),
]