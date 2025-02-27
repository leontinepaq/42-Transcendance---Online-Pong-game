import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .pong import Pong
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
from django.core.cache import cache

User = get_user_model()

class PongSoloGameConsumer(AsyncWebsocketConsumer):
    async def init(self):
        self.game = Pong(use_ai=True)
    
    async def connect(self):
        self.user = await sync_to_async(self.get_user)()
        self.game_running=True
        await self.init()
        await self.accept()
        await self.update()
        asyncio.create_task(self.loop())
    
    def get_token_from_cookies(self):
        cookie_header = dict(self.scope["headers"]).get(b"cookie", b"").decode()
        cookies = dict(cookie.split("=", 1)
                       for cookie in cookie_header.split("; ")
                            if "=" in cookie)
        return cookies.get("access_token")

    def get_user(self):
        token = self.get_token_from_cookies()
        try:            
            decoded_token = AccessToken(token)
            user = User.objects.filter(id=decoded_token["user_id"])
            if user.exists():
                return user.first()
            return AnonymousUser()
        except:            
            return AnonymousUser()
        
    async def end(self):
        return 

    async def disconnect(self, close_code):
        self.game_running = False
        await self.end()

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        if "toggle_pause" in data and data["toggle_pause"]:
            self.game.toggle_pause()
            await self.update()
            return
        if "paddle" in data:
            self.game.move_paddle("left", data["paddle"])
        
    async def update(self):
        await self.send(text_data=json.dumps(self.game.get_state()))
        
    async def loop(self):
        while self.game_running:
            if not self.game.is_paused():
                self.game.update()
                await self.update()
            await asyncio.sleep(0.05)

class PongMultiGameConsumer(PongSoloGameConsumer):
    async def init(self):
        self.game = Pong(use_ai=False)
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        
        if "toggle_pause" in data and data["toggle_pause"]:
            self.game.toggle_pause()
            await self.update()
            return
        if "paddle" in data and "side" in data:
            self.game.move_paddle(data["side"], data["paddle"])
            
class PongOnlineGameConsumer(PongSoloGameConsumer):
    async def init(self):
        self.game_id = self.scope["url_route"]["kwargs"].get("game_id")
        self.game = Pong(use_ai=False)
        self.group_name = f"pong_{self.game_id}"
        self.master = self.get_connected_players() == 0
        if not self.master:
            self.game_running=False
        if self.get_connected_players() < 2:
            await self.channel_layer.group_add(self.group_name,
                                            self.channel_name)
            self.incr_connected_players()
        else:
            self.close(4001)

    def get_connected_players(self):
        return cache.get(self.group_name, 0)

    def incr_connected_players(self):
        cache.set(self.group_name, self.get_connected_players() + 1)

    def decr_connected_players(self):
        cache.set(self.group_name, self.get_connected_players() - 1)

    async def receive(self, text_data):
        if self.get_connected_players() < 2:
            await self.send(json.dumps({"alert": True,
                                        "message": "Waiting for both players to be connected"}))
            return
        if self.master:
            return await self.process(text_data, "left")
        await self.channel_layer.group_send(self.group_name,
                                            {"type": "receive.slave",
                                             "text_data": text_data})

    async def end(self):
        self.decr_connected_players()
        
    async def receive_slave(self, event):
        if self.master:
            await self.process(event["text_data"], "right")

    async def process(self, text_data, side):
        data = json.loads(text_data)

        if "toggle_pause" in data and data["toggle_pause"]:
            self.game.toggle_pause()
            await self.update()
            return
        if "paddle" in data:
            self.game.move_paddle(side, data["paddle"])

    async def update(self):
        if not self.master:
            return
        if self.get_connected_players() < 2:
            self.game.pause()
        await self.channel_layer.group_send(self.group_name,
                                            {"type": "send.update",
                                             "state": self.game.get_state(),
                                             "state_symetric": self.game.get_state(sym=True)})

    async def send_update(self, event):
        if self.master:
            return await self.send(text_data=json.dumps(event["state"]))
        await self.send(text_data=json.dumps(event["state_symetric"]))
