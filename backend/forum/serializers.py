from rest_framework import serializers

from .models import Topic, TopicReply


class TopicReplySerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = TopicReply
        fields = ("id", "topic", "author", "author_name", "body", "created_at")
        read_only_fields = ("id", "topic", "author", "author_name", "created_at")

    def get_author_name(self, obj):
        full_name = obj.author.get_full_name().strip()
        return full_name or obj.author.username


class TopicSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    category_label = serializers.CharField(
        source="get_category_display", read_only=True
    )
    reply_count = serializers.IntegerField(read_only=True)
    replies = TopicReplySerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = (
            "id",
            "author",
            "author_name",
            "title",
            "category",
            "category_label",
            "body",
            "reply_count",
            "replies",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "author",
            "author_name",
            "reply_count",
            "replies",
            "created_at",
            "updated_at",
        )

    def get_author_name(self, obj):
        full_name = obj.author.get_full_name().strip()
        return full_name or obj.author.username
