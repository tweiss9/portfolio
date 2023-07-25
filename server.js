require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { sendEmail } = require('./public/js/sendEmail.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'];
  if (userAgent.includes('Chrome')) {
    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline' https://ajax.googleapis.com 'unsafe-inline' https://maxcdn.bootstrapcdn.com 'unsafe-inline' https://www.google-analytics.com");
  } else if (userAgent.includes('Edge')) {
    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-inline'");
  } else if (userAgent.includes('Firefox')) {
    res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-eval'");
  } else if (userAgent.includes('WebKit')) {
    res.setHeader('Content-Security-Policy', "script-src 'self'");
  } else {
    res.setHeader('Content-Security-Policy', "script-src 'self'");
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;
  sendEmail(name, email, message)
    .then(() => {
      res.json({ success: true });
    })
    .catch((error) => {
      res.status(500).json({ success: false, error: 'Failed to send email' });
    });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
