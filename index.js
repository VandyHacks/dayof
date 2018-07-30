const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const parser = require('body-parser');
const path = require('path');
const cors = require('cors');
const twilio = require('twilio')(process.env.TWILIO_LIVE_SID, process.env.TWILIO_LIVE_AUTH);
const webpush = require('web-push');

const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const publicVapidKey = process.env.WEBPUSH_PUBLIC;
const privateVapidKey = process.env.WEBPUSH_PRIVATE;
const app = express();
// const router = express.Router;

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.use(helmet());
app.use(express.static(__dirname));

app.use(cors());

webpush.setGCMAPIKey(process.env.GCM_KEY);
webpush.setVapidDetails(
  'mailto:kzhai190@gmail.com',
  publicVapidKey,
  privateVapidKey,
);

mongoose.connect(uri);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database open');
  const hackerCollection = db.collection('Hackers');
  const changeStream = hackerCollection.watch();
  changeStream.on('change', (change) => {
    console.log(change);
  });
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
    if (!phoneArr.includes(num)) {
      phoneArr.push(num);
    }
  });
});

app.get('/', cors(), (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
  console.log('Page loaded');
});

app.post('/', (req, res) => {
  Promise.all(
    phoneArr.map(number => twilio.messages.create({
      to: number,
      from: process.env.TWILIO_MASS_SMS_SID,
      body: `VandyHacks: ${req.body.msg}`,
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

/* router.post('/dayof', (req, res) => {
  const sub = req.body;
  console.log(sub);
  res.sendStatus(201);
  webpush.sendNotification(sub, message)
    .catch((err) => {
      console.error(err.stack);
    });
}); */

app.listen(PORT, () => {
  console.log(path.join('Server listening on port ', PORT));
});
