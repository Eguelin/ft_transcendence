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

exec python manage.py runserver 0.0.0.0:8000