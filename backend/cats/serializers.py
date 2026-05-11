from rest_framework import serializers

from .models import Cat


class CatSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    like_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cat
        fields = (
            "id",
            "name",
            "age",
            "breed",
            "hairiness",
            "color",
            "temperament",
            "character_details",
            "favorite_toy",
            "food",
            "litter_trained",
            "vaccinated",
            "photo",
            "photo_url",
            "status",
            "price",
            "show_in_showcase",
            "like_count",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "photo_url", "like_count", "created_at", "updated_at")

    def get_photo_url(self, obj):
        if not obj.photo:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.photo.url) if request else obj.photo.url


class PublicCatSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    owner_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    photo_url = serializers.SerializerMethodField()
    like_count = serializers.IntegerField(read_only=True)
    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Cat
        fields = (
            "id",
            "owner_id",
            "owner_username",
            "owner_name",
            "name",
            "age",
            "breed",
            "hairiness",
            "color",
            "temperament",
            "character_details",
            "favorite_toy",
            "food",
            "litter_trained",
            "vaccinated",
            "photo_url",
            "status",
            "status_label",
            "price",
            "like_count",
            "liked_by_me",
            "notes",
            "updated_at",
        )

    def get_owner_name(self, obj):
        full_name = obj.owner.get_full_name().strip()
        return full_name or obj.owner.username

    def get_photo_url(self, obj):
        if not obj.photo:
            return ""
        request = self.context.get("request")
        return request.build_absolute_uri(obj.photo.url) if request else obj.photo.url

    def get_liked_by_me(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return obj.likes.filter(user=user).exists()
