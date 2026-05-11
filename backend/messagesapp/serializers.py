from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import DirectMessage

User = get_user_model()


class DirectMessageSerializer(serializers.ModelSerializer):
    recipient = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True)
    )

    class Meta:
        model = DirectMessage
        fields = ("id", "sender", "recipient", "body", "created")
        read_only_fields = ("id", "sender", "created")

    def validate_recipient(self, value):
        if value.pk == self.context["request"].user.pk:
            raise serializers.ValidationError("нельзя писать самому себе")
        return value

    def create(self, validated_data):
        validated_data["sender"] = self.context["request"].user
        return super().create(validated_data)
