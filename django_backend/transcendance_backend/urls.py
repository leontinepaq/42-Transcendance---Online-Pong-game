from django.urls import path
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LoginView, LogoutView
from transcendance import views

urlpatterns = [
    #Login page
    path('login/', views.login_view, name='login'),

    # 2FA verification page
    path('verify_2fa/', views.verify_2fa, name='verify_2fa'),

    # Sign up page
    path('signup/', views.signup, name='signup'),

    # Password reset
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

    
	#HOME
    path('', views.home_view, name='home'),
    path('play/', views.play_game, name='play'),
    path('history/', views.history_view, name='history'),
    path('profile/', views.profile_view, name='profile'),


	#PLAY
    path('play/', views.play_view, name='play'),
    # path('play/quick-game-ia/', views.quick_game_ia, name='quick_game_ia'),
    path('play/quick-game-friend/', views.quick_game_friend, name='quick_game_friend'),
    path('play/create-tournament/', views.create_tournament, name='create_tournament'),


	#HISTORY
	path('history/', views.history_view, name='history'),
    path('history/matches/', views.match_history_view, name='match_history'),
    path('history/tournaments/', views.tournament_history_view, name='tournament_history'),
    path('history/tournaments/<int:tournament_id>/', views.tournament_recap_view, name='tournament_recap'),


	#PROFILE
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/password/', views.change_password, name='change_password'),
    path('profile/customize/', views.customize_profile, name='customize_profile'),
    # path('profile/ai-settings/', views.ai_settings, name='ai_settings'),
    path('logout/', LogoutView.as_view(), name='logout'),

	#FRIENDS
    path('friend/<int:friend_id>/', views.friend_profile, name='friend_profile'),
    path('friend/remove/<int:friend_id>/', views.remove_friend, name='remove_friend'),
]
