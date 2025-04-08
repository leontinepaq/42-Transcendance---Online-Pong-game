from django.urls import path, re_path
from .consumers import PongSoloGameConsumer, PongMultiGameConsumer, PongOnlineGameConsumer

websocket_urlpatterns = [
    path("ws/pong/solo/", PongSoloGameConsumer.as_asgi()),
    path("ws/pong/multi/", PongMultiGameConsumer.as_asgi()),
    re_path(r"^ws/pong/online(?:/(?P<user_id_1>[^/]+)/(?P<user_id_2>[^/]+))?/$", PongOnlineGameConsumer.as_asgi()),
]
