from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class BreederRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "first_name", "last_name")

    def validate_username(self, value):
        v = (value or "").strip()
        if not v:
            raise serializers.ValidationError("Обязательное поле")
        if User.objects.filter(username__iexact=v).exists():
            raise serializers.ValidationError(
                "Пользователь с таким именем уже существует."
            )
        return v

    def validate_email(self, value):
        if value in (None, ""):
            return ""
        return value.strip().lower()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        for k in ("first_name", "last_name"):
            if attrs.get(k) is not None:
                attrs[k] = (attrs[k] or "").strip()
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class BreederSerializer(serializers.ModelSerializer):
    cat_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "cat_count")

    def get_cat_count(self, obj):
        return getattr(obj, "cat_count", obj.cats.count())


class NormalizedTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        key = self.username_field
        raw = (attrs.get(key) or "").strip()
        found = User.objects.filter(username__iexact=raw).first()
        if found:
            attrs = {**attrs, key: found.username}
        else:
            attrs = {**attrs, key: raw}
        return super().validate(attrs)
