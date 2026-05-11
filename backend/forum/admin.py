from django.contrib import admin

from .models import Topic, TopicReply


class TopicReplyInline(admin.TabularInline):
    model = TopicReply
    extra = 0


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "author", "updated_at")
    list_filter = ("category",)
    search_fields = ("title", "body", "author__username")
    inlines = (TopicReplyInline,)


@admin.register(TopicReply)
class TopicReplyAdmin(admin.ModelAdmin):
    list_display = ("id", "topic", "author", "created_at")
    search_fields = ("body", "topic__title", "author__username")
