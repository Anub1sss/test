from django.conf import settings
from django.db import models


class Cat(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Ищет дом"
        RESERVED = "reserved", "Забронирован"
        STAYS = "stays", "Остаётся в питомнике"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cats",
    )
    name = models.CharField(max_length=120)
    age = models.PositiveSmallIntegerField(default=1)
    breed = models.CharField(max_length=120, blank=True)
    hairiness = models.CharField(max_length=64, default="средняя")
    color = models.CharField(max_length=80, blank=True)
    temperament = models.CharField(max_length=80, default="спокойный")
    character_details = models.TextField(blank=True)
    favorite_toy = models.CharField(max_length=120, blank=True)
    food = models.CharField(max_length=160, blank=True)
    litter_trained = models.BooleanField(default=True)
    vaccinated = models.BooleanField(default=False)
    photo = models.ImageField(upload_to="cats/", blank=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )
    price = models.PositiveIntegerField(default=0)
    show_in_showcase = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class CatLike(models.Model):
    cat = models.ForeignKey(Cat, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cat_likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("cat", "user"), name="unique_cat_like")
        ]

    def __str__(self):
        return f"{self.user} -> {self.cat}"
