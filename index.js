const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const twilio = require('twilio');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(express.static('HackathonNotification'));