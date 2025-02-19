import json
from channels.generic.websocket import WebsocketConsumer
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework.serializers import Serializer, CharField
from drf_spectacular_websocket.decorators import extend_ws_schema
from asgiref.sync import async_to_sync

class SomeMethodInputSerializer(Serializer):
    message = CharField()

class SomeMethodOutputSerializer(Serializer):
    message = CharField()

class SendMessageOutputSerializer(Serializer):
    message = CharField()

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    @extend_ws_schema(
        type='send',
        summary='some_method_summary',
        description='some_method_description',
        request=SomeMethodInputSerializer,
        responses=SomeMethodOutputSerializer,
    )
    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "chat.message",
                                   "message": message}
        )
        
    # Receive message from room group
    def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        self.send(text_data=json.dumps({"message": message}))