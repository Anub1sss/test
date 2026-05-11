from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def broadcast_direct_message(msg):
    layer = get_channel_layer()
    payload = {
        "type": "direct_message",
        "id": msg.pk,
        "sender_id": msg.sender_id,
        "recipient_id": msg.recipient_id,
        "body": msg.body,
        "created": msg.created.isoformat(),
    }
    event = {"type": "chat.message", "message": payload}
    async_to_sync(layer.group_send)(f"user_{msg.recipient_id}", event)
    async_to_sync(layer.group_send)(f"user_{msg.sender_id}", event)
