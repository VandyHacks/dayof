const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio')(process.env.TWILIO_LIVE_SID, process.env.TWILIO_LIVE_AUTH);
const webpush = require('web-push');
// const Datastore = require('nedb');

const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const publicVapidKey = process.env.WEBPUSH_PUBLIC;
const privateVapidKey = process.env.WEBPUSH_PRIVATE;
// const ds = new Datastore();
const app = express();

module.exports = publicVapidKey;

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.use(helmet());
app.use(express.static(__dirname));
app.use(express.static(`${__dirname}/client`));

app.use(cors());

webpush.setGCMAPIKey(process.env.GCM_KEY);
webpush.setVapidDetails(
  'mailto:kzhai190@gmail.com',
  publicVapidKey,
  privateVapidKey,
);

mongoose.connect(uri, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database open');
});

const phoneArr = [];

let message;

const hackerSchema = new mongoose.Schema({
  firstName: { type: String, max: 20 },
  lastName: { type: String, max: 20 },
  school: { type: String, max: 50 },
  email: { type: String, max: 100 },
  phone: { type: String, max: 15 },
});
const Hacker = db.model('Hacker', hackerSchema);

function dbquery(callback) {
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
  callback();
}

function wait() {
  setTimeout(() => {
    dbquery(wait);
  }, 30000);
}

dbquery(wait);

app.get('/', cors(), (req, res) => {
  res.sendFile(`${__dirname}/form.html`);
  console.log('Page loaded');
});

app.post('/', (req, res) => {
  Promise.all(
    message = req.body.msg,
    phoneArr.map(number => twilio.messages.create({
      to: number,
      from: process.env.TWILIO_MASS_SMS_SID,
      body: `VandyHacks: ${message}`,
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

// Dayof route
app.post('/dayof', (req, res) => {
  // Resource created successfully
  const payload = JSON.stringify({ title: 'VandyHacks', body: message });
  const sub = req.body.subscribe;
  const options = {
    TTL: req.body.timetolive,
  };
  console.log(sub);
  webpush.sendNotification(sub, payload, options)
    .then(res.sendStatus(201))
    .catch((err) => {
      console.log(err.stack);
    });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
