const mongoose = require('mongoose');

const pushSchema = new mongoose.Schema({
  endpoint: String,
  keys: {
    p256dh: String,
    auth: String,
  },
});

const hackerSchema = new mongoose.Schema({
  firstName: { type: String, max: 20 },
  lastName: { type: String, max: 20 },
  school: { type: String, max: 50 },
  email: { type: String, max: 100 },
  phone: { type: String, max: 15 },
});

const msgSchema = new mongoose.Schema({
  msg: String,
  time: Date,
});

module.exports = { pushSchema, hackerSchema, msgSchema };
