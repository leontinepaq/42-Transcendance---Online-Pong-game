import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .pong import Pong
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

class PongGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_type = self.scope["url_route"]["kwargs"].get("game_type")
        self.game_id = self.scope["url_route"]["kwargs"].get("game_id")
        self.user = self.get_user()
        self.room_name = "test"
        self.room_group_name = f"pong_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name,
                                           self.channel_name)
        await self.accept()
        self.game = Pong(use_ai=True)
        self.game_running = True
        asyncio.create_task(self.loop())
        
    async def get_user(self):
        headers = dict(self.scope["headers"])
        cookie_header = headers.get(b"cookie", b"").decode()
        
        # Extract JWT token from cookies manually
        token = None
        cookies = cookie_header.split("; ")
        for cookie in cookies:
            if cookie.startswith("access_token="):
                token = cookie.split("=")[1]
                break
        print("Token is ", token)
        decoded_token=AccessToken(token)
        if User.objects.filter(id=decoded_token["user_id"]).exists:
            return User.objects.filter(id=decoded_token["user_id"]).first()
        return AnonymousUser()

    async def disconnect(self, close_code):
        self.game_running = False
        await self.channel_layer.group_discard(self.room_group_name,
                                               self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Receiving", data)
        if data["toogle_pause"]:
            self.game.toogle_pause()
        if self.game.is_paused():
            return 
        self.game.move_paddle("left", data["paddle_y"])
        
    async def loop(self):
        while self.game_running:
            if not self.game.is_paused():
                self.game.update()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "update",
                        "state": self.game.get_state()
                    }
                )
            await asyncio.sleep(0.05)  # 20 FPS game loop

    async def update(self, event):
        await self.send(text_data=json.dumps(event["state"]))
