const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio')(process.env.TWILIO_LIVE_SID, process.env.TWILIO_LIVE_AUTH);
const webpush = require('web-push');
const WebSocket = require('ws');
const http = require('http');
const Push = require('./schemas/schemas').pushSchema;
const Hack = require('./schemas/schemas').hackerSchema;

const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const publicVapidKey = process.env.WEBPUSH_PUBLIC;
const privateVapidKey = process.env.WEBPUSH_PRIVATE;
const ttl = 600;
const app = express();
const server = http.createServer(app);
server.listen(PORT);

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.use(helmet());
app.use(express.static(__dirname));

app.use(cors());

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

webpush.setGCMAPIKey(process.env.GCM_KEY);
webpush.setVapidDetails(
  'mailto:kzhai190@gmail.com', // change to environment variable
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

const Hacker = db.model('Hacker', Hack);
const PushSub = db.model('PushSubscription', Push);

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

app.get('/dayof', (req, res) => {
  res.sendFile(`${__dirname}/live.html`);
  console.log('Live notifications page loaded');
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/admin.html`);
  console.log('Admin page loaded');
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
      console.log('Message sent'),
      res.redirect('back'),
    )
    .catch((err) => {
      console.log(err);
      res.redirect('back');
    });
});

function isValidSaveRequest(req, res) {
  // Check for endpoint
  if (!req.body || !req.body.endpoint) {
    // Not valid subscription
    res.status(400);
    console.log('Subscription must have endpoint');
    return false;
  }
  return true;
}

function exists(subscription) {
  return PushSub.countDocuments({ endpoint: subscription.endpoint, key: subscription.key });
}

app.post('/savesub', (req, res) => {
  if (isValidSaveRequest(req, res)) {
    const push = new PushSub(req.body);
    exists(push).then((count) => {
      if (count === 0) {
        console.log('Saving subscription to database');
        push.save()
          .then(() => {
            res.setHeader('Content-type', 'application/json');
            res.sendStatus(201);
            console.log('Push subscription saved');
          })
          .catch((err) => {
            console.log('Unable to save push subscription', err);
          });
      } else {
        console.log('Subscription already exists in database');
        res.sendStatus(201);
      }
    });
  }
});

// Dayof route
app.post('/sendpush', (req, res) => {
  // Resource created successfully
  console.log(req.body); // added
  const payload = JSON.stringify({ title: 'VandyHacks', body: req.body.value }); // eslint-disable-line changed message to req.body
  const options = {
    TTL: ttl,
  };
  console.log(payload);
  PushSub.find({}, (err, data) => {
    if (err) throw err;
    Promise.all(
      data.forEach((element) => {
        webpush.sendNotification(element, payload, options);
      }),
    )
      .then(
        console.log('Push notification sent'),
        res.sendStatus(201),
      )
      .catch((error) => {
        console.log(error.stack);
      });
  });
});

module.exports = app;
