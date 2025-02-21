import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .pong import Pong


class PongGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "test"
        self.room_group_name = f"pong_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name,
                                           self.channel_name)
        await self.accept()
        self.game = Pong(use_ai=True)
        self.game_running = True
        asyncio.create_task(self.loop())

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
