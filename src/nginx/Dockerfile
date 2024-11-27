FROM nginx:1.27.0-alpine

# Install openssl
RUN apk add --no-cache openssl nodejs npm

# Create SSL certificate
RUN openssl req -x509 -nodes -newkey rsa:2048 \
	-keyout /etc/ssl/private/transcendence.key \
	-out /etc/ssl/certs/transcendence.crt \
	-subj "/C=FR/ST=Auvergne-Rhone-Alpes/L=Lyon/O=42/CN=localhost/emailAddress=eguelin@student.42lyon.fr"

# Set client_max_body_size to 10M
RUN sed -i 's/http {/http {\n    client_max_body_size 10M;/g' /etc/nginx/nginx.conf

# Copy configuration files
COPY conf /etc/nginx/conf.d

# Copy entrypoint
COPY ./entry/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT [ "entrypoint.sh" ]
