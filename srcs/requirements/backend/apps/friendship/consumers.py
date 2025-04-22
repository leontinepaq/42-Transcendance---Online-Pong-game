import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from pong.consumers import UserConsumer
from django.core.cache import cache
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from .serializers import UserFriendsSerializer
from enum import Enum
from dashboards.models import Tournament

class Status(Enum):
    OFFLINE = 0
    ONLINE = 1
    BUSY = 2

User = get_user_model()

def is_blocked(blockerId, blockedId):
    return User.objects.filter(id=blockerId).first()\
        .blocked.filter(id=blockedId).exists()
        
def get_username(id):
    try:
        return User.objects.filter(id=id).first().username
    except:        
        return "undefined"

def is_online(id):
    return get_status(id) == Status.ONLINE

def is_busy(id):
    return get_status(id) == Status.BUSY

def get_status(id):
    return cache.get(f"user_{id}", Status.OFFLINE)

def get_game_link(id1, id2):
    if id1 < id2:
        return f"/ws/pong/online/{id1}/{id2}/"
    return f"/ws/pong/online/{id2}/{id1}/"

class CommonConsumer(UserConsumer):
    group_name = "common_channel"

    async def connect(self):
        self.user = await sync_to_async(self.get_user)()
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        await self.channel_layer.group_add(self.group_name,
                                           self.channel_name)
        await self.accept()
        asyncio.create_task(self.loop())

    async def loop(self):
        self.online = True
        await self.set_status(Status.ONLINE)
        while self.online:
            await self.update_status()
            await asyncio.sleep(25)

    async def toggle_group_update(self):
        await self.channel_layer.group_send(self.group_name,
                                            {"type": "toggle.update"})
        
    async def update_status(self):
        await self.set_status(get_status(self.user.id))
        
    async def send_next_games(self):
        next = await sync_to_async(self.get_next_games)()
        await self.send(json.dumps({"type": "next-game",
                                    "data": next}))
        
    async def set_status(self, status):
        toggle_update = True
        if get_status(self.user.id) == status:
            toggle_update = False
        cache.set(f"user_{self.user.id}", status, 30)
        if toggle_update:
            await self.toggle_group_update()

    async def disconnect(self, close_code):
        self.online = False
        await self.set_status(Status.OFFLINE)

    def get_friends_data(self):
        friends = self.user.friends.all().order_by("username")
        return [{**UserFriendsSerializer(friend).data,
                 "status": get_status(friend.id).value}
                for friend in friends]
        
    def get_next_games(self):
        next = Tournament.get_next_matchs_for_user(self.user.id)
        if next is None:
            return []
        return [{"id": game["player"].id,
                 "username": game["player"].username,
                 "online": is_online(game["player"].id),
                 "tournament_id": game["tournament"].id,
                 "tournament_name": game["tournament"].name}
                for game in next]

    async def toggle_update(self, event):
        data = {"type": "update",
                "data": await sync_to_async(self.get_friends_data)()}
        await self.send(text_data=json.dumps(data))
        await self.send_next_games()
        
        
    async def complete_data(self, data):
        if "receiver" not in data:
             return
        data["sender"] = self.user.id
        data["sender_username"] = self.user.username
        data["receiver_username"] = await sync_to_async(get_username)(data["receiver"])
        data["init"] = data["type"]

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.complete_data(data)

        # UPDATE TOGGLE
        if data["type"] == "update":
            return await self.toggle_update({})
        
        # BUSY TOGGLE
        if data["type"] == "busy":
            return await self.set_status(Status.BUSY)
        
        if data["type"] == "available":
            return await self.set_status(Status.ONLINE)
                
        # OFFLINE RECEIVER
        if not is_online(data["receiver"]) and not is_busy(data["receiver"]) \
            and (data["type"] == "message" or data["type"] == "game"):
            data["type"] = "offline"
            return await self.send(json.dumps(data))
        
        # BLOCKED BY RECEIVER
        if await sync_to_async(is_blocked)(data["receiver"], self.user.id)\
            and (data["type"] == "message" or data["type"] == "game"):
            data["type"] = "blocked"
            return await self.send(json.dumps(data))
        
        # BUILDING GAME LINK
        if data["type"] == "game":
            data["link"] = get_game_link(int(data["receiver"]), int(data["sender"]))
            if "tournament" in data:
                data["link"] = f"{data["link"]}{data["tournament"]}/"

        # SEND THRU WHOLE GROUP
        await self.channel_layer.group_send(self.group_name,
                                            {"type": "receive.message",
                                             "data": json.dumps(data)})

    async def receive_message(self, event):
        data = json.loads(event["data"])
        
        if self.user.id != int(data["receiver"]):
            return
        if await sync_to_async(is_blocked)(self.user.id,
                                           data["sender"]):
            return
        await self.send(json.dumps(data))
