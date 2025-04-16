from django.urls import path, re_path
from .consumers import PongSoloGameConsumer, PongMultiGameConsumer, PongOnlineGameConsumer

websocket_urlpatterns = [
    path("ws/pong/solo/", PongSoloGameConsumer.as_asgi()),
    path("ws/pong/multi/", PongMultiGameConsumer.as_asgi()),
    path("ws/pong/online/", PongOnlineGameConsumer.as_asgi()),
    path("ws/pong/online/<str:user_id_1>/<str:user_id_2>/", PongOnlineGameConsumer.as_asgi()),
    path("ws/pong/online/<str:user_id_1>/<str:user_id_2>/<str:tournament_id>/", PongOnlineGameConsumer.as_asgi()),
]
