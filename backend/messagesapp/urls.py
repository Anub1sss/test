from django.urls import path

from .views import DirectMessageListCreateView

urlpatterns = [
    path("messages/", DirectMessageListCreateView.as_view(), name="messages"),
]
