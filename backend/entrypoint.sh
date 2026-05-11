#!/bin/sh
set -e

until python manage.py migrate --noinput; do
  sleep 2
done

if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); username = '$DJANGO_SUPERUSER_USERNAME'; email = '$DJANGO_SUPERUSER_EMAIL'; password = '$DJANGO_SUPERUSER_PASSWORD'; user, _ = User.objects.get_or_create(username=username, defaults={'email': email}); user.email = email; user.is_staff = True; user.is_superuser = True; user.set_password(password); user.save()"
fi

exec daphne -b 0.0.0.0 -p 8000 core.asgi:application
