import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from pong.consumers import UserConsumer
from django.core.cache import cache
from asgiref.sync import sync_to_async
from django.contrib.auth.models import AnonymousUser
from .serializers import UserFriendsSerializer

class CommonConsumer(UserConsumer):
    
    async def init(self):
        self.user = await sync_to_async(self.get_user)()
        if self.user == AnonymousUser():
            self.close()
        self.set_online()
        await self.channel_layer.group_add("common_channel",
                                           self.channel_name)
        asyncio.create_task(self.toggle_update())
        
    def set_online(self):
        cache.set(self.user.id, True)
        
    async def disconnect(self, close_code):
        cache.set(self.user.id, False)
        self.toggle_update()
        
    async def toggle_update(self):
        print("Toggle update")
        friends = UserFriendsSerializer(self.user.friends, many=True)
        for friend in friends.data:
            friend.online = cache.get(friend.id, False)
        print(friends.data)
        await self.send(text_data=json.dumps(friends.data))
