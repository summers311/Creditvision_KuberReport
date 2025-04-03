#!/bin/bash

# Exit on error
set -e

echo "=== Creditvision KuberReport Setup with PM2 and HTTPS Support ==="

# Repository directory name
REPO_DIR="Creditvision_KuberReport"
APP_NAME="creditvision"

# Check if pm2 is installed, if not install it
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
fi

# Check if application is already running in PM2 and remove it
if pm2 list | grep -q "$APP_NAME"; then
    echo "Found existing PM2 process for $APP_NAME. Removing it..."
    pm2 delete "$APP_NAME"
    echo "Old PM2 process removed."
fi

# Check if the directory already exists
if [ -d "$REPO_DIR" ]; then
    echo "Found existing repository directory. Removing it..."
    rm -rf "$REPO_DIR"
    echo "Old repository removed."
fi

# Clone the repository
echo "Cloning fresh repository..."
git clone https://github.com/summers311/Creditvision_KuberReport.git

# Change into the directory
echo "Changing to project directory..."
cd "$REPO_DIR"

# Create SSL certificates directory
echo "Creating SSL certificates directory..."
mkdir -p ssl

# Generate self-signed SSL certificates
echo "Generating self-signed SSL certificates..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/server.key -out ssl/server.crt -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
echo "SSL certificates generated."

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

# Install dependencies with legacy-peer-deps
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "Building the application..."
npm run build

# Start the application with PM2 using our custom server
echo "Starting the application with HTTP and HTTPS support using PM2..."
pm2 start server.js --name "$APP_NAME" --env production

# Save the PM2 process list to be restored after reboot
echo "Saving PM2 process configuration..."
pm2 save

# Setup PM2 to start on system boot (might require sudo)
echo "Setting up PM2 to start on system boot..."
echo "If the next command fails, run: 'sudo env PATH=$PATH:/usr/bin pm2 startup $(cat /etc/os-release | grep -oP '(?<=^ID=).+' | tr -d '"')' and follow the instructions"
pm2 startup

echo "=== Setup complete! ==="
echo "Your application is running with PM2 and will restart automatically if it crashes"
echo "The application is accessible at:"
echo "- HTTP: http://localhost:80"
echo "- HTTPS: https://localhost:443"
echo ""
echo "Note: Since the SSL certificate is self-signed, browsers will show a security warning."
echo "For internal use, you can proceed past this warning or add an exception for this certificate."
echo ""
echo "Useful PM2 commands:"
echo "- View logs: pm2 logs $APP_NAME"
echo "- Monitor app: pm2 monit"
echo "- Restart app: pm2 restart $APP_NAME"
echo "- Stop app: pm2 stop $APP_NAME"
echo "- Delete from PM2: pm2 delete $APP_NAME"
