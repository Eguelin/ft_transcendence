#!/bin/sh

set -e

host="$POSTGRES_HOST:$POSTGRES_PORT"

until nc -z "$host" 2>/dev/null; do
  echo "Waiting for $host to be available..."
  sleep 1
done

echo "$host is available - executing command"
python manage.py makemigrations
python manage.py migrate

if [ "$DJANGO_DEBUG" = "True" ]; then
  exec python manage.py runserver 0.0.0.0:8000
else
  exec daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application
fi
