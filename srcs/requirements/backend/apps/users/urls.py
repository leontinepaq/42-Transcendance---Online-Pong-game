from django.urls import path
from .views import register, login, send_activation_link, activate, verify_2fa

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("send_activation_link/", send_activation_link),
    path("activate/<uidb64>/<token>", activate),
    path("verify_2fa/", verify_2fa),
]
