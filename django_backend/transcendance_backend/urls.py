from django.urls import path
from django.contrib.auth import views as auth_views
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

]
