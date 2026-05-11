from django.db.models import Q
from rest_framework import generics

from .models import DirectMessage
from .serializers import DirectMessageSerializer
from .ws import broadcast_direct_message


class DirectMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = DirectMessageSerializer

    def get_queryset(self):
        u = self.request.user
        return (
            DirectMessage.objects.filter(Q(sender=u) | Q(recipient=u))
            .select_related("sender", "recipient")
            .order_by("-created")
        )

    def perform_create(self, serializer):
        instance = serializer.save()
        broadcast_direct_message(instance)
