from django.contrib import admin
from django.contrib.admin.sites import NotRegistered
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User


try:
    admin.site.unregister(User)
except NotRegistered:
    pass


@admin.register(User)
class BreederAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "cat_count",
    )

    @admin.display(description="Котов")
    def cat_count(self, obj):
        return obj.cats.count()
