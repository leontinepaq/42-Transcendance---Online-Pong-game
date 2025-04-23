from django.urls import path
from .views import (register,
                    pre_login,
                    login,
                    logout,
                    auth_check,
                    send_2fa_mail_activation,
                    verify_2fa_mail,
                    get_2fa_qr_activation,
                    verify_2fa_qr,
					forgotten_password)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("register/", register),
    path("pre_login/", pre_login),
    path("login/", login),
    path("logout/", logout),
    path("check_auth/", auth_check),
    
    path("send_2fa_mail_activation/", send_2fa_mail_activation),
    path("verify_2fa_mail/", verify_2fa_mail),
    path('get_2fa_qr_activation/', get_2fa_qr_activation),
    path('verify_2fa_qr/', verify_2fa_qr),
	path('forgotten_password', forgotten_password)
]