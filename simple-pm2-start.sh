#!/bin/bash

# Simple script to build and start the Credit Report Dashboard with PM2
echo "=== Building and starting Credit Report Dashboard with PM2 ==="

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
else
  echo "Dependencies already installed. To reinstall, delete the node_modules directory."
fi

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

# Build the application
echo "Building the application..."
npm run build

# Create PM2 ecosystem file
echo "Creating PM2 configuration..."
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [
    {
      name: 'credit-report-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        PORT: 7777,
        NODE_ENV: 'production'
      }
    }
  ]
}
EOL

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 start ecosystem.config.js

echo "Application should now be running at http://localhost:7777"
echo "To check status: pm2 status"
echo "To view logs: pm2 logs credit-report-dashboard"
echo "To stop: pm2 stop credit-report-dashboard"