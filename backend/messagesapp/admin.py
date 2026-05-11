from django.contrib import admin

from .models import DirectMessage


@admin.register(DirectMessage)
class DirectMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "recipient", "created")
