FROM python:3.12.4-alpine3.20

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Set environment variables
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN apk add build-base zlib-dev jpeg-dev
RUN pip install -r requirements.txt

# Copy script
COPY script/ /bin/
RUN chmod 777 /bin/start

# Expose port 8000
EXPOSE 8000
