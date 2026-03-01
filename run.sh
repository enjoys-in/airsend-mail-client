#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting deployment..."

 
echo "📥 Pulling latest changes from Git..."
git pull origin main

echo "📦 Installing dependencies..."
bun install 

echo "🏗️ Building project..."
bun run build

echo "🔁 Restarting PM2 process..."
pm2 restart 0

echo "✅ Deployment completed successfully!"
