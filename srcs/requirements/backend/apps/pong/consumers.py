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
        print("Master ?", self.master)
        if not self.master:
            self.game_running=False
        if self.get_connected_players() < 2:
            await self.channel_layer.group_add(self.group_name,
                                            self.channel_name)
            self.incr_connected_players()
        else:
            self.close(4001)

    def get_connected_players(self):
        print("Number of players: ", cache.get(self.group_name, 0))
        return cache.get(self.group_name, 0)

    def incr_connected_players(self):
        cache.set(self.group_name, self.get_connected_players() + 1)
        self.get_connected_players()

    def decr_connected_players(self):
        cache.set(self.group_name, self.get_connected_players() - 1)
        self.get_connected_players()

    async def receive(self, text_data):
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
        await self.channel_layer.group_send(self.group_name,
                                            {"type": "send.update",
                                             "state": self.game.get_state(),
                                             "state_symetric": self.game.get_state(sym=True)})

    async def send_update(self, event):
        if self.master:
            return await self.send(text_data=json.dumps(event["state"]))
        print("Send update", event["state_symetric"])
        await self.send(text_data=json.dumps(event["state_symetric"]))

# class PongGameConsumer(AsyncWebsocketConsumer):
    
#     async def connect(self):
#         self.user = await sync_to_async(self.get_user)()
#         self.game_type = self.scope["url_route"]["kwargs"].get("game_type")
#         self.use_ai = False
#         self.game_running=True
#         self.master=True
        
#         if self.game_type == "online":
#             self.game_id = self.scope["url_route"]["kwargs"].get("game_id")
#             self.group_name = f"pong_{self.game_id}"
#             if self.get_connected_players() == 1:
#                 self.master=False
#             if self.get_connected_players() < 2:
#                 await self.channel_layer.group_add(self.group_name,
#                                                 self.channel_name)
#                 self.incr_connected_players()
#             else:
#                 self.close(4001)
#         elif self.game_type == "solo":
#             self.use_ai = True

#         self.game = Pong(use_ai=self.use_ai)
#         await self.accept()
#         if self.master:
#             asyncio.create_task(self.loop())

#     def get_connected_players(self):
#         return cache.get(self.group_name, 0)
    
#     def incr_connected_players(self):
#         cache.set(self.group_name, self.get_connected_players() + 1)
        
#     def decr_connected_players(self):
#         cache.set(self.group_name, self.get_connected_players() - 1)
    
#     def get_token_from_cookies(self):
#         cookie_header = dict(self.scope["headers"]).get(b"cookie", b"").decode()
#         cookies = dict(cookie.split("=", 1)
#                        for cookie in cookie_header.split("; ")
#                             if "=" in cookie)
#         return cookies.get("access_token")

#     def get_user(self):
#         token = self.get_token_from_cookies()
#         try:            
#             decoded_token = AccessToken(token)
#             user = User.objects.filter(id=decoded_token["user_id"])
#             if user.exists():
#                 return user.first()
#             return AnonymousUser()
#         except:            
#             return AnonymousUser()

#     async def disconnect(self, close_code):
#         self.game_running = False
#         if self.game_type == "online":
#             self.decr_connected_players()
#             await self.channel_layer.group_discard(self.group_name,
#                                                    self.channel_name)

#     async def receive(self, text_data):
#         instructions = {"type": "instructions",
#                         "instructions": text_data,
#                         "is_master": self.master}
#         if self.game_type == "online" and not self.master:
#             await self.channel_layer.group_send(self.group_name, instructions)
#         else:
#             await self.instructions(instructions)
        
#     async def instructions(self, event):
#         data = json.loads(event["instructions"])
#         is_master = event["is_master"]

#         if "toggle_pause" in data and data["toggle_pause"]:
#             self.game.toggle_pause()
#             await self.send_update()
#             return
        
#         if self.game.is_paused():
#             return        
#         if "paddle" not in data:
#             return
#         if self.game_type == "solo":
#             data["side"] = "left"
#         elif self.game_type == "online":
#             data["side"] = "right"
#             if is_master:
#                 data["side"] = "left"
#         elif "side" not in data \
#             or data["side"] not in {"left", "right"}:
#             return
#         self.game.move_paddle(data["side"],
#                               data["paddle"])
        
#     async def send_update_group(self):
#         if not self.master:
#             return
#         await self.channel_layer.group_send(self.group_name,
#                                             {"type": "update",
#                                              "state": self.game.get_state(),
#                                              "state_symetric": self.game.get_state(sym=True)})

#     async def update(self, event):
#         if self.master:
#             await self.send(text_data=json.dumps(event["state"]))
#         else:
#             await self.send(text_data=json.dumps(event["state_symetric"]))
        
#     async def send_update(self):
#         if self.game_type == "online":
#             await self.send_update_group()
#         else:
#             await self.send(text_data=json.dumps(self.game.get_state()))
        
#     async def loop(self):
#         while self.game_running:
#             if not self.game.is_paused():
#                 self.game.update()
#                 await self.send_update()
#             await asyncio.sleep(0.05)

