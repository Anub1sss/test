from django.db.models import Count
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Topic
from .serializers import TopicReplySerializer, TopicSerializer


class TopicViewSet(viewsets.ModelViewSet):
    serializer_class = TopicSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return (
            Topic.objects.select_related("author")
            .prefetch_related("replies__author")
            .annotate(reply_count=Count("replies"))
            .order_by("-updated_at")
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(methods=("post",), detail=True)
    def reply(self, request, pk=None):
        topic = self.get_object()
        serializer = TopicReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(topic=topic, author=request.user)
        topic.save(update_fields=("updated_at",))
        return Response(serializer.data, status=201)
