require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const { sendEmail } = require('./public/js/sendEmail.js');

app.set('view engine', 'ejs'); 

const crypto = require('crypto');
const nonce = crypto.randomBytes(16).toString('base64');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'];
  if (userAgent.includes('Chrome')) {
    res.setHeader('Content-Security-Policy', `script-src 'self' https://ajax.googleapis.com https://maxcdn.bootstrapcdn.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com 'nonce-${nonce}'`);
  } else if (userAgent.includes('Edge')) {
    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'");
  } else if (userAgent.includes('Firefox')) {
    res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`);
  } else if (userAgent.includes('WebKit')) {
    res.setHeader('Content-Security-Policy', "script-src 'self'");
  } else {
    res.setHeader('Content-Security-Policy', "script-src 'self'");
  }
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/get-site-key', (req, res) => {
  const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY;
  res.json({ recaptchaSiteKey });
});

app.post('/verify-recaptcha', async (req, res) => {
  const { recaptchaResponse, recaptchaSecretKey} = req.body;

  try {
    console.log("Received reCAPTCHA response:", recaptchaResponse);
    const recaptchaVerification = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        response: recaptchaResponse,
        secret: recaptchaSecretKey,
      }
    );

    console.log("reCAPTCHA verification data:", recaptchaVerification.data);

    if (recaptchaVerification.data.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  sendEmail(name, email, message)
    .then(() => {
      res.json({ success: true });
    })
    .catch((error) => {
      res.status(500).json({ success: false, error: error });
    });
});
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
