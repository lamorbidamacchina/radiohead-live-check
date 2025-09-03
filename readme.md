# 🎸 Radiohead Schedule Monitor

A simple Node.js application that continuously polls the Radiohead schedule API and alerts you when any changes are detected.

![Radiohead Live Check](https://www.lamorbidamacchina.com/images/radiohead-live-check.png)

## Features

- 🔄 **Real-time monitoring**: Polls the [Radiohead schedule API](https://rsrc.wasteheadquarters.com/schedule.json) every 10 seconds
- 🚨 **Simple change detection**: Detects any byte-level changes in the JSON response
- 🔊 **Audio alerts**: Console beep sound when changes are detected
- 📧 **Email alerts**: Send email notifications when schedule changes
- 💾 **Persistent storage**: Saves schedule data to track changes across restarts
- 🎨 **Colorful output**: Rich console output with emojis and colors
- ⚙️ **Environment-based config**: Secure configuration using .env files

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd radiohead-live-check
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

## Configuration

### Environment Variables (.env file)

The application uses environment variables for secure configuration. Copy `env.example` to `.env` and customize:

```bash
# API Configuration
API_URL=https://rsrc.wasteheadquarters.com/schedule.json
POLL_INTERVAL=10000

# Email Configuration
EMAIL_ENABLED=true
EMAIL_FROM=webmaster@localhost
EMAIL_TO=your-email@example.com
EMAIL_SUBJECT=🚨 Radiohead Schedule Changed!

# SMTP Configuration
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

# Alert Configuration
ALERT_SOUND=true
```

### SMTP Options

**Option 1: Localhost/System SMTP (Recommended)**
```bash
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

**Option 2: Custom SMTP Server**
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

**Option 3: Gmail**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Usage

### Start monitoring:
```bash
npm start
```

### Development mode (auto-restart on changes):
```bash
npm run dev
```

### Stop monitoring:
Press `Ctrl+C` to gracefully stop the application.

## How it works

The application:
1. **Loads configuration** from environment variables
2. **Polls the API** every 10 seconds
3. **Compares raw JSON responses** byte-by-byte (no parsing needed)
4. **Alerts immediately** when any change is detected
5. **Sends test email** on startup to verify configuration
6. **Saves the new response** for future comparisons

## Example Output

```
🎸 Radiohead Schedule Monitor
========================================
Polling https://rsrc.wasteheadquarters.com/schedule.json every 10 seconds
Press Ctrl+C to stop

✅ Email alerts enabled
📧 Sending test email...
🔊 Testing beep sound...
📧 Test email sent successfully!
✅ First run - loading current schedule

[2:30:15 PM] Polling schedule...
  ✅ No changes detected

[2:30:25 PM] Polling schedule...
🚨 SCHEDULE CHANGES DETECTED! 🚨
📧 Email alert sent successfully
```

## Files

- `index.js` - Main application logic
- `config.js` - Configuration loader
- `env.example` - Example environment variables
- `.env` - Your actual configuration (create this)
- `package.json` - Dependencies and scripts
- `last-schedule.json` - Stored schedule data (created automatically)
- `.gitignore` - Prevents sensitive data from being committed

## Dependencies

- `node-fetch` - HTTP requests to the API
- `chalk` - Colored console output
- `nodemailer` - Email sending
- `dotenv` - Environment variable loading
- `nodemon` - Development auto-restart (dev dependency)

## Security

- **Environment variables** keep sensitive data out of code
- **Gitignore** prevents `.env` files from being committed
- **No hardcoded credentials** in source code

## API Endpoint

The application polls: `https://rsrc.wasteheadquarters.com/schedule.json`

This endpoint provides real-time information about Radiohead and related projects' live performances, exhibitions, and events.

## Troubleshooting

- **Permission errors**: Ensure you have write permissions in the project directory
- **Network issues**: Check your internet connection and firewall settings
- **API errors**: The application will continue polling and retry on the next cycle
- **Email errors**: Check your SMTP configuration in the `.env` file
- **No beep sound**: Console beep may not work in all terminal environments

## License

MIT License - feel free to modify and distribute!
