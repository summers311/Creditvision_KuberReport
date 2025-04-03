#!/bin/bash

# Script to build and start the Credit Report Dashboard with PM2 using HTTPS
echo "=== Building and starting Credit Report Dashboard with HTTPS using PM2 ==="

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

# Create SSL certificates directory if it doesn't exist
if [ ! -d "ssl" ]; then
  echo "Creating SSL certificates directory..."
  mkdir -p ssl
fi

# Generate self-signed SSL certificates if they don't exist
if [ ! -f "ssl/server.key" ] || [ ! -f "ssl/server.crt" ]; then
  echo "Generating self-signed SSL certificates..."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/server.key -out ssl/server.crt -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
  echo "SSL certificates generated."
else
  echo "SSL certificates already exist."
fi

# Create custom HTTPS server
echo "Creating custom HTTPS server..."
cat > server.js << EOL
const { createServer: createHttpsServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/server.crt')),
};

const HTTP_PORT = 80;
const HTTPS_PORT = 443;

app.prepare().then(() => {
  // Create HTTPS server
  createHttpsServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(HTTPS_PORT, (err) => {
    if (err) throw err;
    console.log(\`> HTTPS Ready on https://localhost:\${HTTPS_PORT}\`);
  });

  // Create HTTP server
  createHttpServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(HTTP_PORT, (err) => {
    if (err) throw err;
    console.log(\`> HTTP Ready on http://localhost:\${HTTP_PORT}\`);
  });
});
EOL

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
      script: 'server.js',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
EOL

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 start ecosystem.config.js

echo "Application should now be running at:"
echo "- HTTP: http://localhost:80"
echo "- HTTPS: https://localhost:443"
echo ""
echo "Note: Since the SSL certificate is self-signed, browsers will show a security warning."
echo "For internal use, you can proceed past this warning or add an exception for this certificate."
echo ""
echo "To check status: pm2 status"
echo "To view logs: pm2 logs credit-report-dashboard"
echo "To stop: pm2 stop credit-report-dashboard"
