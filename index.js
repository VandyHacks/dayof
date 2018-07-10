const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const twilio = require('twilio');
const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const app = express();

app.use(helmet());
app.use(express.static('VandyHacksNotification'));

mongoose.connect(uri);
mongoose.Promise = global.Promise;

var db = mongoose.connection;

var client = new twilio(process.env.TWILIO_TEST_SID, process.env.TWILIO_TEST_AUTH);

