#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting deployment..."

# Navigate to your project directory (optional)
cd /path/to/your/project || exit 1

echo "📥 Pulling latest changes from Git..."
git pull origin main

echo "📦 Installing dependencies..."
npm install --production

echo "🏗️ Building project..."
npm run build

echo "🔁 Restarting PM2 process..."
pm2 restart 0

echo "✅ Deployment completed successfully!"
