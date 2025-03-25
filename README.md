# Credit Report Dashboard - Simple Start Scripts

This repository contains simple scripts to build and start the Credit Report Dashboard application.

## Available Scripts

### 1. Ultra Simple Start (ultra-simple-start.sh)

The most basic script that just installs dependencies, builds, and starts the application:

```bash
chmod +x ultra-simple-start.sh
./ultra-simple-start.sh
```

### 2. Simple Start (simple-start.sh)

A script with basic error handling that installs dependencies (if needed), builds, and starts the application:

```bash
chmod +x simple-start.sh
./simple-start.sh
```

### 3. PM2 Start (simple-pm2-start.sh)

For production use on your Ubuntu server. This script:
- Installs dependencies (if needed)
- Installs PM2 (if needed)
- Builds the application
- Creates a PM2 configuration
- Starts the application with PM2

```bash
chmod +x simple-pm2-start.sh
./simple-pm2-start.sh
```

## Usage on Ubuntu Server

1. Make the script executable:
   ```bash
   chmod +x simple-pm2-start.sh
   ```

2. Run the script:
   ```bash
   ./simple-pm2-start.sh
   ```

3. Access the application at:
   ```
   http://your-server-ip:7777
   ```

## Dependency Conflict Resolution

All scripts use the `--legacy-peer-deps` flag when installing dependencies to resolve conflicts between packages like date-fns and react-day-picker. This approach allows the installation to proceed despite peer dependency conflicts.

If you encounter other dependency issues, you can try:

```bash
# Remove node_modules and reinstall with force
rm -rf node_modules
npm install --force
```

## PM2 Commands

- Check status: `pm2 status`
- View logs: `pm2 logs credit-report-dashboard`
- Stop application: `pm2 stop credit-report-dashboard`
- Restart application: `pm2 restart credit-report-dashboard`