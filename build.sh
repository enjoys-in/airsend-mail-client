#!/bin/bash

set -e

APP_NAME="airsend-mail"
PORT="9500"
MEMORY_LIMIT="512m"
ENV_FILE=".env"

echo "🛑 Stopping old container..."
docker stop $APP_NAME 2>/dev/null || true

echo "🗑️  Removing old container..."
docker rm $APP_NAME 2>/dev/null || true

echo "🧹 Removing old image..."
docker rmi $APP_NAME 2>/dev/null || true

echo "🔨 Building fresh image..."
docker build -t $APP_NAME .

echo "🚀 Running container..."
docker run -d \
  --name $APP_NAME \
  --memory=$MEMORY_LIMIT \
  --env-file $ENV_FILE \
  -p $PORT:3000 \
  --restart unless-stopped \
  $APP_NAME

echo "✅ Container '$APP_NAME' is running on port $PORT (memory limit: $MEMORY_LIMIT)"
docker ps --filter "name=$APP_NAME"
