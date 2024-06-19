FROM python:3.12.4-alpine3.20

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Set environment variables
WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application files
COPY app/ .

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
