#!/bin/bash
# Ultra-simple script to start the Credit Report Dashboard

# Install dependencies with legacy-peer-deps to fix dependency conflicts
npm install --legacy-peer-deps

# Build the application
npm run build

# Start the application on port 80
PORT=80 npm run start
