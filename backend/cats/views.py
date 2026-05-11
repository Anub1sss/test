from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.generics import ListAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cat, CatLike
from .permissions import IsCatOwner
from .serializers import CatSerializer, PublicCatSerializer


class CatViewSet(viewsets.ModelViewSet):
    serializer_class = CatSerializer
    permission_classes = (permissions.IsAuthenticated, IsCatOwner)
    parser_classes = (JSONParser, FormParser, MultiPartParser)

    def get_queryset(self):
        return (
            Cat.objects.filter(owner=self.request.user)
            .annotate(like_count=Count("likes"))
            .order_by("-updated_at", "name")
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ShowcaseCatListView(ListAPIView):
    serializer_class = PublicCatSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return (
            Cat.objects.filter(show_in_showcase=True)
            .select_related("owner")
            .annotate(like_count=Count("likes"))
            .order_by("status", "-updated_at")
        )


class CatLikeToggleView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        cat = get_object_or_404(Cat, pk=pk, show_in_showcase=True)
        like, created = CatLike.objects.get_or_create(cat=cat, user=request.user)
        if not created:
            like.delete()
        return Response({"liked": created, "like_count": cat.likes.count()})
