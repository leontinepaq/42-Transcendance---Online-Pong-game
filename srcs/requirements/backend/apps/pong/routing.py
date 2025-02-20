from django.urls import re_path
from .consumers import PongGameConsumer

websocket_urlpatterns = [
    re_path(r"ws/pingpong/$", PongGameConsumer.as_asgi()),
]