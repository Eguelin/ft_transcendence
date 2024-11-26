#!/bin/sh

set -e

npm install --prefix /usr/share/nginx/html

host="$DJANGO_HOST:$DJANGO_PORT"

until nc -z $host; do
  >&2 echo "Django is unavailable - sleeping"
  sleep 1
done

nginx -g "daemon off;"
