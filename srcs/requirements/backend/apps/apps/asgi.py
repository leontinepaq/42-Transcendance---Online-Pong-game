import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import pong.routing
import friendship.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "apps.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": URLRouter(pong.routing.websocket_urlpatterns 
                               + friendship.routing.websocket_urlpatterns),
    }
)