import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from pong.consumers import UserConsumer
from django.core.cache import cache
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from .serializers import UserFriendsSerializer

User = get_user_model()


def is_blocked(blockerId, blockedId):
    return User.objects.filter(id=blockerId).first()\
        .blocked.filter(id=blockedId).exists()


def isOnline(id):
    return cache.get(id, False)


class CommonConsumer(UserConsumer):
    group_name = "common_channel"

    async def connect(self):
        self.user = await sync_to_async(self.get_user)()
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        self.set_online()
        await self.channel_layer.group_add(self.group_name,
                                           self.channel_name)
        await self.accept()
        asyncio.create_task(self.loop())

    async def loop(self):
        self.online = True
        while self.online:
            self.set_online()
            await self.toggle_group_update()
            await asyncio.sleep(25)

    async def toggle_group_update(self):
        await self.channel_layer.group_send(self.group_name,
                                            {"type": "toggle.update"})

    def set_online(self):
        cache.set(self.user.id, True, 30)

    async def disconnect(self, close_code):
        self.online = False
        cache.set(self.user.id, False)
        await self.toggle_group_update()

    def get_friends_data(self):
        friends = self.user.friends.all().order_by("username")
        return [{**UserFriendsSerializer(friend).data,
                 "online": cache.get(friend.id, False)}
                for friend in friends]

    async def toggle_update(self, event):
        data = {"type": "update",
                "data": await sync_to_async(self.get_friends_data)()}
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data):
        data = json.loads(text_data)
        data["sender"] = self.user.id
        data["sender_username"] = self.user.username

        if data["type"] == "update":
            return await self.toggle_update({})
        if not isOnline(data["receiver"]):
            return await self.send(json.dumps({"type": "offline",
                                               "init": data["type"],
                                               "receiver": data["receiver"]}))
        if await sync_to_async(is_blocked)(data["receiver"], self.user.id):
            return await self.send(json.dumps({"type": "blocked",
                                               "init": data["type"],
                                               "receiver": data["receiver"]}))
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
