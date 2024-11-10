#!/bin/sh

set -e

host="$DJANGO_HOST:$DJANGO_PORT"

until nc -z $host; do
  >&2 echo "Django is unavailable - sleeping"
  sleep 1
done

nginx -g "daemon off;"
