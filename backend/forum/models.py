from django.conf import settings
from django.db import models


class Topic(models.Model):
    class Category(models.TextChoices):
        CARE = "care", "Уход"
        HEALTH = "health", "Здоровье"
        FOOD = "food", "Питание"
        BEHAVIOR = "behavior", "Поведение"
        BREEDING = "breeding", "Разведение"
        STORIES = "stories", "Истории"

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="forum_topics",
    )
    title = models.CharField(max_length=160)
    category = models.CharField(
        max_length=24, choices=Category.choices, default=Category.CARE
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)

    def __str__(self):
        return self.title


class TopicReply(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="replies")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="forum_replies",
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self):
        return f"Reply #{self.pk} to {self.topic}"
