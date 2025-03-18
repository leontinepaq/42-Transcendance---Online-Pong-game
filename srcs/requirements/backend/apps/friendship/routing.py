from django.urls import path, re_path
from .consumers import CommonConsumer

websocket_urlpatterns = [
    path("ws/users/", CommonConsumer.as_asgi()),
]
