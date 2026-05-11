from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CatLikeToggleView, CatViewSet, ShowcaseCatListView

router = DefaultRouter()
router.register("cats", CatViewSet, basename="cat")

urlpatterns = [
    path("showcase/", ShowcaseCatListView.as_view(), name="showcase"),
    path("showcase/<int:pk>/like/", CatLikeToggleView.as_view(), name="showcase-like"),
    path("", include(router.urls)),
]
