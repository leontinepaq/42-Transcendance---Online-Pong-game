from django.urls import path
from .views import register, login, verify_2fa, logout, auth_check, send_2fa, 
    verify_authenticator, activate_authenticator, display_profile, update_email, update_username,
    update_password, update_2FA, update_avatar
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("logout/", logout),
    path("send_2fa/", send_2fa),
    path("verify_2fa/", verify_2fa),
    path("auth_check/", auth_check),
    #remove names
    path('activate_authenticator/', activate_authenticator, name='activate_authenticator'),
    path('authenticator/', verify_authenticator, name='authenticator'),

    path("profile/", display_profile, name="display_profile"),
    path("profile/update-email/", update_email, name="update_email"),
    path("profile/update-username/", update_username, name="update_username"),
    path("profile/update-password/", update_password, name="update_password"),
    path("profile/update-2fa/", update_2FA, name="update_2FA"),
    path("profile/update-avatar/", update_avatar, name="update_avatar"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
