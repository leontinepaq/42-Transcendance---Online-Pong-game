from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from users.models import UserProfile
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

@receiver(m2m_changed, sender=UserProfile.friends.through)
@receiver(m2m_changed, sender=UserProfile.blocked.through)
def trigger_chat_update(sender, instance, action, reverse, model, pk_set, **kwargs):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)("common_channel",
                                            {"type": "toggle.update"})
