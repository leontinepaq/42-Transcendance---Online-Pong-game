from django.urls import path
from .views import (profile,
                    other_profile,
                    all_profiles,
                    update_email,
                    update_username,
                    update_password,
                    deactivate_2FA,
                    update_avatar,)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", profile, name="display_profile"),
    path("all/", all_profiles, name="display_all_profiles"),
    path("other", other_profile, name="display_other_profile"),
    path("update/email/", update_email, name="update_email"),
    path("update/username/", update_username, name="update_username"),
    path("update/password/", update_password, name="update_password"),
    path("update/avatar/", update_avatar, name="update_avatar"),
    path("deactivate_2fa/", deactivate_2FA, name="deactivate_2FA"),
]

#allow to serve media files during development. When in production, nginx will do that I think
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
