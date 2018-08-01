const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const parser = require('body-parser');
const path = require('path');
const cors = require('cors');
const twilio = require('twilio')(process.env.TWILIO_LIVE_SID, process.env.TWILIO_LIVE_AUTH);
const webpush = require('web-push');
// const mongooseObserver = require('mongoose-observer');
const source = require('../VandyHacksForm/index');

const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const publicVapidKey = process.env.WEBPUSH_PUBLIC;
const privateVapidKey = process.env.WEBPUSH_PRIVATE;
const app = express();

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.use(helmet());
app.use(express.static(__dirname));
app.use(express.static(`${__dirname}/../VandyHacksForm`));

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
});

let message;

app.get('/', cors(), (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
  console.log('Page loaded');
});

app.post('/', (req, res) => {
  Promise.all(
    message = req.body.msg,
    source.phoneArr.map(number => twilio.messages.create({
      to: number,
      from: process.env.TWILIO_MASS_SMS_SID,
      body: `VandyHacks: ${message}`,
    })),
  )
    .then(
      console.log(source.phoneArr),
      res.redirect('back'),
    )
    .catch((err) => {
      console.log(err);
      res.redirect('back');
    });
});

app.post('/dayof', (req, res) => {
  const sub = req.body;
  console.log(sub);
  res.sendStatus(201);
  webpush.sendNotification(sub, message)
    .catch((err) => {
      console.error(err.stack);
    });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
