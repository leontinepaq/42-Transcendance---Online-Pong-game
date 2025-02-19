from django.urls import path
from .views import (display_profile, display_other_profile, update_email, update_username,
    update_password, deactivate_2FA, update_avatar)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", display_profile, name="display_profile"),
    path("display-other-profile", display_other_profile, name="display_other_profile"),
    path("update-email/", update_email, name="update_email"),
    path("update-username/", update_username, name="update_username"),
    path("update-password/", update_password, name="update_password"),
    path("deactivate-2fa/", deactivate_2FA, name="deactivate_2FA"),
    path("update-avatar/", update_avatar, name="update_avatar"),
]

#allow to serve media files during development. When in production, nginx will do that I think
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
