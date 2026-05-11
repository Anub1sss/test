from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

jwt_auth = JWTAuthentication()


@database_sync_to_async
def fetch_user(user_id):
    if user_id is None:
        return AnonymousUser()
    from django.contrib.auth import get_user_model

    User = get_user_model()
    try:
        return User.objects.get(pk=user_id, is_active=True)
    except User.DoesNotExist:
        return AnonymousUser()


class JwtAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        scope["user"] = AnonymousUser()
        raw = scope.get("query_string", b"").decode()
        token = parse_qs(raw).get("token", [None])[0]
        if token:
            try:
                validated = jwt_auth.get_validated_token(token)
                user_id = validated.get("user_id")
                scope["user"] = await fetch_user(user_id)
            except (InvalidToken, TokenError, TypeError):
                pass
        return await self.inner(scope, receive, send)
