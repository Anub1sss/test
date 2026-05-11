from django.contrib.auth.models import User
from django.db.models import Count
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    BreederRegisterSerializer,
    BreederSerializer,
    NormalizedTokenObtainPairSerializer,
)


class RegisterBreederView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = BreederRegisterSerializer


class TokenView(TokenObtainPairView):
    serializer_class = NormalizedTokenObtainPairSerializer


class BreedersListView(generics.ListAPIView):
    serializer_class = BreederSerializer

    def get_queryset(self):
        return (
            User.objects.filter(is_active=True)
            .annotate(cat_count=Count("cats"))
            .exclude(pk=self.request.user.pk)
            .order_by("username")
        )


class MeView(generics.RetrieveAPIView):
    serializer_class = BreederSerializer
    queryset = User.objects.all()

    def get_object(self):
        return self.request.user
