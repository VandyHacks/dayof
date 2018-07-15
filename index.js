const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const parser = require('body-parser');
const path = require('path');
const cors = require('cors');
const twilio = require('twilio')(process.env.TWILIO_LIVE_SID, process.env.TWILIO_LIVE_AUTH);

const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const app = express();

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.use(helmet());
app.use(express.static('VandyHacksNotification'));

app.use(cors());

mongoose.connect(uri);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database open');
});

const phoneArr = [];

const hackerSchema = new mongoose.Schema({
  firstName: { type: String, max: 20 },
  lastName: { type: String, max: 20 },
  school: { type: String, max: 50 },
  email: { type: String, max: 100 },
  phone: { type: String, max: 15 },
});
const Hacker = db.model('Hacker', hackerSchema);

Hacker.find({}, (err, data) => {
  if (err) throw err;
  data.forEach((element) => {
    let num = element.phone;
    num = num.replace(/-/g, '');
    phoneArr.push(num);
  });
});

app.get('/', cors(), (req, res) => {
  res.sendFile(path.join(__dirname, '/form.html'));
  console.log('Page loaded');
});

app.post('/', (req, res) => {
  Promise.all(
    phoneArr.map(number => twilio.messages.create({
      to: number,
      from: process.env.TWILIO_MASS_SMS_SID,
      body: path.join('VandyHacks: ', req.body.msg),
    })),
  )
    .then(
      res.redirect('back'),
    )
    .catch((err) => {
      console.log(err);
      res.redirect('back');
    });
});

app.listen(PORT, () => {
  console.log(path.join('Server listening on port ', PORT));
});
