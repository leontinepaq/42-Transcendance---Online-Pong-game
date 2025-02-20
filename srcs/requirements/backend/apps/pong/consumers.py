import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .pong import Pong  # Import Pong class

class PongGameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "pingpong_game"
        self.room_group_name = f"game_{self.room_name}"

        await self.accept()

        self.game = Pong(use_ai=True)
        await self.start_game_loop()
        # self.room_name = "pingpong"
        # await self.channel_layer.group_add(self.room_name, self.channel_name)
        # await self.accept()

        # Track players
        # self.player_side = None  # Will be "left" or "right"
        # self.game = None

        # Assign player side
        # if not hasattr(self.channel_layer, "players"):
        #     self.channel_layer.players = []
        
        # if len(self.channel_layer.players) == 0:
        #     self.channel_layer.players.append(self.channel_name)
        #     self.player_side = "left"
        #     self.game = Pong(use_ai=True)  # Start with AI
        # elif len(self.channel_layer.players) == 1:
        #     self.channel_layer.players.append(self.channel_name)
        #     self.player_side = "right"
        #     self.game.use_ai = False  # Now it's 1v1 mode

        # self.channel_layer.players.append(self.channel_name)
        # self.player_side = "left"
        # self.game = Pong(use_ai=True)
        # Start the game loop only if it's the first player
        # if self.player_side == "left":
        #     print("starting")
            # await self.start_game_loop()

    async def disconnect(self, close_code):
        # self.channel_layer.players.remove(self.channel_name)
        # if len(self.channel_layer.players) == 0:
            # del self.channel_layer.players

        # await self.channel_layer.group_discard(self.room_name, self.channel_name)
        pass

    async def receive(self, text_data):
        """Handle paddle movement from players."""
        print("Received message")
        data = json.loads(text_data)

        if "paddle_y" in data and self.player_side:
            self.game.move_paddle(self.player_side, data["paddle_y"])

    async def start_game_loop(self):
        """Main game loop that updates and broadcasts state."""
        while True:
            self.game.update()
            self.send(text_data = json.dumps(self.game.get_state()))
            await asyncio.sleep(0.05)  # 20 FPS game loop

    async def send_update(self, event):
        """Send updated game state to frontend."""
        await self.send(text_data=json.dumps(event["state"]))
