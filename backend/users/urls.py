from django.urls import path

from .views import BreedersListView, MeView, RegisterBreederView

urlpatterns = [
    path("register/", RegisterBreederView.as_view(), name="register"),
    path("breeders/", BreedersListView.as_view(), name="breeders"),
    path("me/", MeView.as_view(), name="me"),
]
