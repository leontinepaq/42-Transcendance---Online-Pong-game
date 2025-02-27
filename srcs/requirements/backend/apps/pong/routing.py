from django.urls import path, re_path
from .consumers import PongSoloGameConsumer, PongMultiGameConsumer, PongOnlineGameConsumer

websocket_urlpatterns = [
    path("ws/pong/solo/", PongSoloGameConsumer.as_asgi()),
    path("ws/pong/multi/", PongMultiGameConsumer.as_asgi()),
    re_path("ws/pong/online/(?P<game_id>\w+)/$", PongOnlineGameConsumer.as_asgi()),
]
