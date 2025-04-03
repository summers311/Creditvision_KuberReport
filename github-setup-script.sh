#!/bin/bash

# Exit on error
set -e

echo "=== Creditvision KuberReport Setup with PM2 ==="

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

# Install dependencies with legacy-peer-deps
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the application
echo "Building the application..."
npm run build

# Start the application with PM2
echo "Starting the application on port 80 with PM2..."
PORT=80 pm2 start npm --name "$APP_NAME" -- run start

# Save the PM2 process list to be restored after reboot
echo "Saving PM2 process configuration..."
pm2 save

# Setup PM2 to start on system boot (might require sudo)
echo "Setting up PM2 to start on system boot..."
echo "If the next command fails, run: 'sudo env PATH=$PATH:/usr/bin pm2 startup $(cat /etc/os-release | grep -oP '(?<=^ID=).+' | tr -d '"')' and follow the instructions"
pm2 startup

echo "=== Setup complete! ==="
echo "Your application is running with PM2 and will restart automatically if it crashes"
echo ""
echo "Useful PM2 commands:"
echo "- View logs: pm2 logs $APP_NAME"
echo "- Monitor app: pm2 monit"
echo "- Restart app: pm2 restart $APP_NAME"
echo "- Stop app: pm2 stop $APP_NAME"
echo "- Delete from PM2: pm2 delete $APP_NAME"