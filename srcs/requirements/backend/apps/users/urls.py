from django.urls import path
from .views import register, login, send_activation_link, activate, verify_2fa, verify_authenticator, generate_totp_secret_and_qr

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("send_activation_link/", send_activation_link),
    path("activate/<uidb64>/<token>/", activate),
    path("verify_2fa/", verify_2fa),
    path('generate_totp_secret_and_qr/', generate_totp_secret_and_qr, name='generate_totp_secret_and_qr'),
    path('verify_totp_code/', verify_authenticator, name='verify_authenticator'),
]
