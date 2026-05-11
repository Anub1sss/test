from django.contrib import admin

from .models import Cat, CatLike


@admin.register(Cat)
class CatAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "owner",
        "age",
        "breed",
        "status",
        "price",
        "litter_trained",
        "show_in_showcase",
    )
    list_filter = (
        "status",
        "show_in_showcase",
        "litter_trained",
        "vaccinated",
        "breed",
        "hairiness",
        "temperament",
    )
    search_fields = ("name", "owner__username", "breed", "notes")


@admin.register(CatLike)
class CatLikeAdmin(admin.ModelAdmin):
    list_display = ("id", "cat", "user", "created_at")
    search_fields = ("cat__name", "user__username")
