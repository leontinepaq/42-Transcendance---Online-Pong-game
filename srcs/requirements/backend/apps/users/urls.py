from django.urls import path
from .views import register, login, send_activation_link, activate, verify_2fa, logout, auth_check

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("send_activation_link/", send_activation_link),
    path("activate/<uidb64>/<token>", activate),
    path("verify_2fa/", verify_2fa),
    path("logout/", logout),
    path("auth_check/", auth_check),
]
