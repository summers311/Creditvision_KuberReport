#!/bin/bash

# Simple script to build and start the Credit Report Dashboard application
echo "=== Building and starting Credit Report Dashboard ==="

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --legacy-peer-deps
else
  echo "Dependencies already installed. To reinstall, delete the node_modules directory."
fi

# Build the application
echo "Building the application..."
npm run build

# Start the application on port 7777
echo "Starting the application on port 7777..."
PORT=7777 npm run start

echo "Application should now be running at http://localhost:7777"