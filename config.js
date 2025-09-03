// Load environment variables from .env file
require('dotenv').config();

module.exports = {
  // API endpoint to poll
  apiUrl: process.env.API_URL || 'https://rsrc.wasteheadquarters.com/schedule.json',
  
  // Polling interval in milliseconds (10 seconds)
  pollInterval: parseInt(process.env.POLL_INTERVAL) || 10000,
  
  // File to store the last known schedule
  dataFile: 'last-schedule.json',
  
  // Enable console beep sound for alerts
  alertSound: process.env.ALERT_SOUND !== 'false',
  
  // Email alert configuration
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    
    // SMTP Configuration
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT) || 25,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    },
    
    // Email addresses
    from: process.env.EMAIL_FROM || 'webmaster@localhost',
    to: process.env.EMAIL_TO || '',
    subject: process.env.EMAIL_SUBJECT || '🚨 Radiohead Schedule Changed!'
  }
};
