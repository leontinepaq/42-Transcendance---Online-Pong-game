from django.urls import re_path
from .consumers import PongGameConsumer

websocket_urlpatterns = [
    re_path("ws/pong/(?P<game_type>\w+)/(?P<game_id>\w+)/$", PongGameConsumer.as_asgi()),
]
