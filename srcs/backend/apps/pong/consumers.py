import json
import asyncio
from datetime import timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
from .pong import Pong
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
from django.core.cache import cache
from dashboards.models import Game
from channels.layers import get_channel_layer

User = get_user_model()

def get_user(id):
    user = User.objects.filter(id=id)
    if user.exists():
        return user.first()
    return AnonymousUser()

class UserConsumer(AsyncWebsocketConsumer):
    def get_token_from_cookies(self):
        cookie_header = dict(self.scope["headers"]).get(
            b"cookie", b"").decode()
        cookies = dict(cookie.split("=", 1)
                       for cookie in cookie_header.split("; ")
                       if "=" in cookie)
        return cookies.get("access_token")

    def get_user(self):
        token = self.get_token_from_cookies()
        try:
            decoded_token = AccessToken(token)
            return get_user(decoded_token["user_id"])
        except:
            return AnonymousUser()


class PongSoloGameConsumer(UserConsumer):
    async def init(self):
        self.game = Pong(use_ai=True)
        asyncio.create_task(self.loop())

    async def connect(self):
        self.user = await sync_to_async(self.get_user)()
        self.save = True
        self.start = True
        self.run = True
        await self.init()
        await self.accept()
        await self.update()

    async def disconnect(self, close_code):
        self.run = False

    async def receive(self, text_data):
        data = json.loads(text_data)
        if "toggle_pause" in data and data["toggle_pause"]:
            self.game.toggle_pause()
            await self.update()
            return
        
        if "paddle" in data:
            self.game.move_paddle("left", data["paddle"])

        if "ai_paddle" in data:  # 👈 Ajouter la gestion de l'IA
            self.game.move_paddle("right", data["ai_paddle"])

    async def update(self):
        test = self.game.get_state()
        await self.send(text_data=json.dumps(self.game.get_state()))

    async def save_game(self):
        await sync_to_async(Game.create_ai)(id_player=self.user.id,
                                            score_player=self.game.score[0],
                                            score_ai=self.game.score[1],
                                            duration=timedelta(seconds=self.game.total_time),
                                            longest_exchange=self.game.longuest_exchange)

    async def loop(self):
        while not self.start:
            await asyncio.sleep(0.1)
        await self.update()
        while not self.game.over:
            if not self.game.is_paused():
                self.game.update()
                await self.update()
            await asyncio.sleep(0.016)
        if self.game.over and self.save:
            await self.save_game()


class PongMultiGameConsumer(PongSoloGameConsumer):
    async def init(self):
        self.save = False
        self.game = Pong(use_ai=False)
        asyncio.create_task(self.loop())

    async def receive(self, text_data):
        data = json.loads(text_data)

        if "toggle_pause" in data and data["toggle_pause"]:
            self.game.toggle_pause()
            await self.update()
            return
        if "paddle" in data and "side" in data:
            self.game.move_paddle(data["side"], data["paddle"])

    async def disconnect(self, close_code):
        self.run = False


def get_last_game_id():
    return cache.get("last_game_id", 0)


def incr_last_game_id():
    cache.set("last_game_id", get_last_game_id() + 1)

class PongOnlineGameConsumer(PongSoloGameConsumer):    
        
    async def init(self):
        self.start = False
        self.over = False
        self.random = True
        self.message = ""
        self.opponent = {"id":0, "username":""}
        self.game = Pong(use_ai=False)

        kwargs = self.scope['url_route']['kwargs']
        user_id_1 = kwargs.get('user_id_1')
        user_id_2 = kwargs.get('user_id_2')
        self.tournament_id = kwargs.get('tournament_id')
        
        if user_id_1 != None and user_id_2 != None:
            self.random = True

        if not self.random and self.user.id != user_id_1 and self.user.id != user_id_2:
            await self.close()
        
        self.set_group()
        self.master = self.get_connected_players() == 0
        await self.channel_layer.group_add(self.group_name,
                                           self.channel_name)
        self.incr_connected_players()
        await self.init_master()
        await self.init_slave()

    async def init_master(self):
        if self.master:
            asyncio.create_task(self.send_info_group("message",
                                                     "Waiting for 2nd player"))
            asyncio.create_task(self.loop())

    async def init_slave(self):
        if self.master:
            return
        incr_last_game_id()
        asyncio.create_task(self.send_identity())
        
    async def send_identity(self):
        await self.channel_layer.group_send(self.group_name,
                                            {"type": "receive.identity",
                                             "id": self.user.id,
                                             "username": self.user.username})
    
    async def receive_identity(self, event):
        if event["id"] == self.user.id:
            return
        self.opponent["id"] = event["id"]
        self.opponent["username"] = event["username"]
        if self.master:
            await self.send_identity()
            await self.send_info_group("message", "")
            await self.send_info_group("start", True)

    def set_group(self):
        self.group_name = f"pong_{get_last_game_id()}"

    def get_connected_players(self):
        return cache.get(self.group_name, 0)

    def incr_connected_players(self):
        cache.set(self.group_name,
                  self.get_connected_players() + 1)

    def decr_connected_players(self):
        cache.set(self.group_name,
                  self.get_connected_players() - 1)

    async def send_info_group(self, key, value):
        # if onlyIfBothConnected and self.get_connected_players() != 2:
        #     return
        await self.channel_layer.group_send(self.group_name,
                                            {"type": "receive.info",
                                             "key": key,
                                             "value": value})

    async def receive_info(self, event):
        setattr(self, event["key"], event["value"])
        await self.send(text_data=json.dumps({"info": True,
                                              "message": self.message,
                                              "run": self.start and self.run,
                                              "opponent": self.opponent["username"]}))

    async def receive(self, text_data):
        if self.over:
            return
        if self.master:
            return await self.process(text_data, "left")
        await self.channel_layer.group_send(self.group_name,
                                            {"type": "receive.slave",
                                             "text_data": text_data})

    async def receive_slave(self, event):
        if self.master:
            await self.process(event["text_data"], "right")

    async def process(self, text_data, side):
        data = json.loads(text_data)

        if "toggle_pause" in data and data["toggle_pause"] \
                and self.start and self.run and not self.over:
            self.game.toggle_pause()
            await self.update()
            return
        if "paddle" in data:
            self.game.move_paddle(side, data["paddle"])

    async def update(self):
        if not self.master:
            return
        if self.game.over and not self.over:
            await self.send_info_group("over", True)
            await self.send_info_group("run", False)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "send.update",
             "state": self.game.get_state(),
             "state_symetric": self.game.get_state(sym=True)})

    async def send_update(self, event):
        data = event["state"]
        if not self.master:
            data = event["state_symetric"]
        await self.send(text_data=json.dumps(data))

    async def disconnect(self, close_code):
        self.run = False
        if self.start \
                and not self.over \
                and self.get_connected_players() == 2:
            await self.send_info_group("run", False)
            await self.send_info_group("message", "Player got disconnected")
            await self.send_info_group("over", True)
        self.decr_connected_players()

    async def save_game(self):
        game, winner = await sync_to_async(Game.create)(id1=self.user.id,
                                         id2=self.opponent["id"],
                                         score_1=self.game.score[0],
                                         score_2=self.game.score[1],
                                         duration=timedelta(seconds=self.game.total_time),
                                         longest_exchange=self.game.longuest_exchange,
                                         tournament_id=self.tournament_id)
        if self.tournament_id != None:
            channel_layer = get_channel_layer()
            await channel_layer.group_send("common_channel",
                                           {"type": "toggle.update"})
