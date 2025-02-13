from django.urls import path
from .views.auth import (register,
                         pre_login,
                         login,
                         logout,
                         auth_check,
                         send_2fa_mail_activation,
                         verify_2fa_mail,
                         get_2fa_qr_activation,
                         verify_2fa_qr,)
from .views.profile import (display_profile, update_email, update_username,
    update_password, update_2FA, update_avatar)
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

    path("profile/", display_profile, name="display_profile"),
    path("update/email/", update_email, name="update_email"),
    path("update/username/", update_username, name="update_username"),
    path("update/password/", update_password, name="update_password"),
    path("update/2fa/", update_2FA, name="update_2FA"),
    path("update/avatar/", update_avatar, name="update_avatar"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
