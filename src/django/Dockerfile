FROM python:3.12.4-alpine3.20

RUN apk add --no-cache postgresql-client build-base zlib-dev jpeg-dev

# Add profile picture
COPY images/ /images/

# Set environment variables
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy script
COPY entry/ /bin/
RUN chmod 755 /bin/entrypoint.sh

# Expose port 8000
EXPOSE 8000

# Run the application
ENTRYPOINT [ "entrypoint.sh" ]
