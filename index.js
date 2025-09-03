const fetch = require('node-fetch');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Configuration
const CONFIG = require('./config');

// Browser-like headers to avoid 403 errors
const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://rsrc.wasteheadquarters.com/',
  'Origin': 'https://rsrc.wasteheadquarters.com',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin'
};

// Store the last known schedule as raw string
let lastScheduleRaw = null;
let isFirstRun = true;

// Email transporter
let emailTransporter = null;

// Initialize email transporter
function initEmailTransporter() {
  console.log(chalk.blue('📧 Initializing email transporter...'));
  console.log(chalk.gray(`  Host: ${CONFIG.email.smtp.host}`));
  console.log(chalk.gray(`  Port: ${CONFIG.email.smtp.port}`));
  console.log(chalk.gray(`  Secure: ${CONFIG.email.smtp.secure}`));
  console.log(chalk.gray(`  User: ${CONFIG.email.smtp.auth.user || 'none'}`));
  console.log(chalk.gray(`  Pass: ${CONFIG.email.smtp.auth.pass ? '***' : 'none'}`));
  console.log(chalk.gray(`  From: ${CONFIG.email.from}`));
  console.log(chalk.gray(`  To: ${CONFIG.email.to}`));
  
  if (CONFIG.email.enabled) {
    try {
      // For localhost, we don't need authentication
      const smtpConfig = {
        host: CONFIG.email.smtp.host,
        port: CONFIG.email.smtp.port,
        secure: CONFIG.email.smtp.secure
      };
      
      // Only add auth if credentials are provided
      if (CONFIG.email.smtp.auth.user && CONFIG.email.smtp.auth.pass) {
        smtpConfig.auth = CONFIG.email.smtp.auth;
        console.log(chalk.yellow('⚠️  Using SMTP authentication'));
      } else {
        console.log(chalk.yellow('⚠️  No SMTP credentials provided, trying without authentication (localhost mode)'));
      }
      
      emailTransporter = nodemailer.createTransport(smtpConfig);
      console.log(chalk.green('✅ Email alerts enabled'));
    } catch (error) {
      console.error(chalk.red('❌ Error initializing email transporter:'), error.message);
      emailTransporter = null;
    }
  } else {
    console.log(chalk.yellow('⚠️  Email alerts disabled - set EMAIL_ENABLED=true in .env'));
  }
}

// Function to send email alert
async function sendEmailAlert() {
  if (!emailTransporter || !CONFIG.email.enabled) return;
  
  try {
    const mailOptions = {
      from: CONFIG.email.from,
      to: CONFIG.email.to,
      subject: CONFIG.email.subject,
      html: `
        <h2>🚨 Radiohead Schedule Changed!</h2>
        <p>The Radiohead schedule has been updated.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>API:</strong> ${CONFIG.apiUrl}</p>
        <br>
        <p>Check the schedule for new events, updates, or changes.</p>
        <hr>
        <p><em>This alert was sent by your Radiohead Schedule Monitor</em></p>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    console.log(chalk.green('📧 Email alert sent successfully'));
  } catch (error) {
    console.error(chalk.red('❌ Error sending email alert:'), error.message);
  }
}

// Function to send test email
async function sendTestEmail() {
  if (!emailTransporter || !CONFIG.email.enabled) {
    console.log(chalk.red('❌ Cannot send test email - transporter not initialized or email disabled'));
    return;
  }
  
  try {
    console.log(chalk.blue('📧 Attempting to send test email...'));
    
    const mailOptions = {
      from: CONFIG.email.from,
      to: CONFIG.email.to,
      subject: '🧪 Radiohead Schedule Monitor - Test Email',
      html: `
        <h2>🧪 Test Email - Radiohead Schedule Monitor</h2>
        <p>This is a test email to verify that email alerts are working correctly.</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Status:</strong> Email configuration is working! ✅</p>
        <br>
        <p>You will now receive email alerts whenever the Radiohead schedule changes.</p>
        <hr>
        <p><em>This test was sent by your Radiohead Schedule Monitor</em></p>
      `
    };
    
    console.log(chalk.gray(`  From: ${mailOptions.from}`));
    console.log(chalk.gray(`  To: ${mailOptions.to}`));
    console.log(chalk.gray(`  Subject: ${mailOptions.subject}`));
    
    const result = await emailTransporter.sendMail(mailOptions);
    console.log(chalk.green('📧 Test email sent successfully!'));
    console.log(chalk.gray(`  Message ID: ${result.messageId}`));
    
  } catch (error) {
    console.error(chalk.red('❌ Error sending test email:'), error.message);
    console.log(chalk.yellow('⚠️  Please check your email configuration in .env'));
    
    // Additional debugging for common issues
    if (error.code === 'ECONNREFUSED') {
      console.log(chalk.red('  → Connection refused. Check if Postfix is running on port 25'));
    } else if (error.code === 'ETIMEDOUT') {
      console.log(chalk.red('  → Connection timeout. Check firewall settings'));
    } else if (error.code === 'EAUTH') {
      console.log(chalk.red('  → Authentication failed. Check SMTP credentials'));
    }
    
    console.log(chalk.blue('💡 Troubleshooting tips:'));
    console.log(chalk.gray('  - Ensure Postfix is running: sudo systemctl status postfix'));
    console.log(chalk.gray('  - Check Postfix logs: sudo tail -f /var/log/mail.log'));
    console.log(chalk.gray('  - Verify port 25 is open: sudo netstat -tlnp | grep :25'));
  }
}

// Utility function to create a console beep sound
function beep() {
  if (CONFIG.alertSound) {
    // Repeat beep 5 times with delays for better alerting
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        process.stdout.write('\x07'); // Console beep
      }, i * 200); // 200ms delay between each beep
    }
  }
}

// Function to save current schedule to file
function saveSchedule(scheduleRaw) {
  try {
    fs.writeFileSync(CONFIG.dataFile, scheduleRaw);
  } catch (error) {
    console.error(chalk.red('Error saving schedule to file:'), error.message);
  }
}

// Function to load last known schedule from file
function loadLastSchedule() {
  try {
    if (fs.existsSync(CONFIG.dataFile)) {
      return fs.readFileSync(CONFIG.dataFile, 'utf8');
    }
  } catch (error) {
    console.error(chalk.red('Error loading last schedule:'), error.message);
  }
  return null;
}

// Function to detect changes by comparing raw strings
function detectChanges(oldScheduleRaw, newScheduleRaw) {
  if (!oldScheduleRaw || !newScheduleRaw) return false;
  return oldScheduleRaw !== newScheduleRaw;
}

// Main polling function
async function pollSchedule() {
  try {
    console.log(chalk.gray(`[${new Date().toLocaleTimeString()}] Polling schedule...`));
    
    const response = await fetch(CONFIG.apiUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const currentScheduleRaw = await response.text();
    
    if (isFirstRun) {
      console.log(chalk.green('✅ First run - loading current schedule'));
      lastScheduleRaw = loadLastSchedule() || currentScheduleRaw;
      saveSchedule(currentScheduleRaw);
      isFirstRun = false;
      return;
    }
    
    // Detect changes by comparing raw strings
    const hasChanges = detectChanges(lastScheduleRaw, currentScheduleRaw);
    
    if (hasChanges) {
      console.log(chalk.magenta('🚨 SCHEDULE CHANGES DETECTED! 🚨'));
      beep(); // Alert sound
      
      // Send email alert
      await sendEmailAlert();
      
      // Save new schedule
      lastScheduleRaw = currentScheduleRaw;
      saveSchedule(currentScheduleRaw);
    } else {
      console.log(chalk.gray('  ✅ No changes detected'));
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Error polling schedule: ${error.message}`));
  }
}

// Main execution
console.log(chalk.blue('🎸 Radiohead Schedule Monitor'));
console.log(chalk.blue('=' .repeat(40)));
console.log(chalk.gray(`Polling ${CONFIG.apiUrl} every ${CONFIG.pollInterval / 1000} seconds`));
console.log(chalk.gray('Press Ctrl+C to stop\n'));

// Initialize email transporter
initEmailTransporter();

// Send test email if email is enabled
if (CONFIG.email.enabled) {
  console.log(chalk.blue('📧 Sending test email...'));
  setTimeout(() => {
    sendTestEmail();
  }, 1000); // Small delay to ensure transporter is ready
}

// Test beep when starting
console.log(chalk.yellow('🔊 Testing beep sound...'));
beep();

// Start polling
pollSchedule();
setInterval(pollSchedule, CONFIG.pollInterval);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Shutting down Radiohead Schedule Monitor...'));
  process.exit(0);
});
