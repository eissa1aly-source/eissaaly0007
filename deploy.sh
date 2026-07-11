#!/bin/bash
echo "🚀 Starting deployment..."
docker-compose up -d --build
echo "✅ Deployment complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend: http://localhost:5000"
