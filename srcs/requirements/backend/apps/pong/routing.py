from django.urls import path
from .consumers import PongGameConsumer

websocket_urlpatterns = [
    path("ws/pingpong/", PongGameConsumer.as_asgi()),
]
