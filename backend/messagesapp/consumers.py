from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .models import DirectMessage
from .ws import broadcast_direct_message


@database_sync_to_async
def try_create_message(sender_id, recipient_id, body):
    from django.contrib.auth import get_user_model

    User = get_user_model()
    if sender_id == recipient_id:
        return None, "self"
    if not User.objects.filter(pk=recipient_id, is_active=True).exists():
        return None, "recipient"
    msg = DirectMessage.objects.create(
        sender_id=sender_id,
        recipient_id=recipient_id,
        body=body,
    )
    return msg, None


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if user is None or isinstance(user, AnonymousUser):
            await self.close(code=4001)
            return
        self.group_name = f"user_{user.pk}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if getattr(self, "group_name", None):
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )

    async def receive_json(self, content, **kwargs):
        recipient_id = content.get("recipient_id")
        body = (content.get("body") or "").strip()
        if recipient_id is None or not body:
            await self.send_json(
                {"kind": "error", "detail": "recipient_id и body обязательны"}
            )
            return
        try:
            recipient_id = int(recipient_id)
        except (TypeError, ValueError):
            await self.send_json(
                {"kind": "error", "detail": "recipient_id должен быть числом"}
            )
            return
        user = self.scope["user"]
        msg, err = await try_create_message(user.pk, recipient_id, body)
        if err == "self":
            await self.send_json({"kind": "error", "detail": "нельзя себе"})
            return
        if err == "recipient":
            await self.send_json({"kind": "error", "detail": "получатель не найден"})
            return
        await sync_to_async(broadcast_direct_message)(msg)

    async def chat_message(self, event):
        await self.send_json(event["message"])
