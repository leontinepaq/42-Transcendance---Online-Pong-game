from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from users.views import CookieTokenRefreshView

urlpatterns = [
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    path('admin/', admin.site.urls),
    
    path('token/refresh/', CookieTokenRefreshView.as_view()),
    
    path('user/', include("users.urls")),
    path('profile/', include("userprofile.urls")),
    path('dashboards/', include("dashboards.urls")),
    path('friends/', include("friendship.urls"))
]
