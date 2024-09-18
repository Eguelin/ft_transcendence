FROM node:20.5 AS builder

WORKDIR /html
COPY ./html .

RUN npm install


FROM nginx:1.27.0-alpine

# Install openssl
RUN apk add --no-cache openssl

# Create SSL certificate
RUN openssl req -x509 -nodes -newkey rsa:2048 \
	-keyout /etc/ssl/private/transcendence.key \
	-out /etc/ssl/certs/transcendence.crt \
	-subj "/C=FR/ST=Auvergne-Rhone-Alpes/L=Lyon/O=42/CN=localhost/emailAddress=eguelin@student.42lyon.fr"

# Copy configuration files
COPY conf /etc/nginx/conf.d