const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio')(process.env.TWILIO_LIVE_SID, process.env.TWILIO_LIVE_AUTH);
const needle = require('needle');
const webpush = require('web-push');
const WebSocket = require('ws');
const Push = require('./schemas/schemas').pushSchema;
const Hack = require('./schemas/schemas').hackerSchema;
const Msg = require('./schemas/schemas').msgSchema;

const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const publicVapidKey = process.env.WEBPUSH_PUBLIC;
const privateVapidKey = process.env.WEBPUSH_PRIVATE;
const ttl = 600;
const app = express();

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.use(helmet());
app.use(express.static(__dirname));

app.use(cors());

webpush.setGCMAPIKey(process.env.GCM_KEY);
webpush.setVapidDetails(
  'mailto:dev@vandyhacks.org',
  publicVapidKey,
  privateVapidKey,
);

mongoose.connect(uri, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'db connection error:'));
db.once('open', () => {
  console.log('Database open');
});

const phoneArr = [];

const Hacker = db.model('Hacker', Hack);
const PushSub = db.model('PushSubscription', Push);
const Message = db.model('Message', Msg);

function dbquery(callback) {
  Hacker.find({}, (err, data) => {
    if (err) {
      console.error(err);
      callback();
      return;
    }

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

const server = app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/dist/dayof.html`);
  console.log('Live notifications page loaded');
}).listen(PORT);

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.ping('ping');
  ws.on('ping', () => {
    ws.pong('pong');
  });
  const keepAlive = setInterval(() => {
    if (ws.readyState !== 1) {
      clearInterval(keepAlive);
      ws.terminate();
    } else {
      ws.ping('pingdata');
    }
  }, 5000);
  ws.on('close', () => {
    console.log('Breaking connection');
  })
});

app.get('/login', (req, res) => {
  res.sendFile(`${__dirname}/auth.html`);
  console.log('Login page loaded');
});

app.get('/admin', (req, res) => {
  res.sendFile(`${__dirname}/admin.html`);
  console.log('Admin page loaded');
});

app.post('/admin', (req, res) => {
  phoneArr.map(number => twilio.messages.create({
    to: number,
    from: process.env.TWILIO_MASS_SMS_SID,
    body: `VandyHacks: ${req.body.msg}`,
  }));
  res.sendStatus(200);
  res.redirect('back');
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
  const d = new Date();
  const newMsg = new Message({ header: req.body.header, msg: req.body.value, time: d });
  newMsg.save()
    .catch((err) => {
      console.log('Unable to save message to database: ', err);
    });
  // Resource created successfully
  console.log(req.body); // added
  const payload = JSON.stringify({ title: `VandyHacks: ${req.body.header}`, body: req.body.value, time: d });
  const options = {
    TTL: ttl,
  };
  console.log(payload);
  const chromePush = new Promise((resolve, reject) => {
    PushSub.find({}, (err, data) => {
      if (err) reject(err);
      data.forEach((element) => {
        console.log('Data: ', element);
        webpush.sendNotification(element, payload, options);
      });
    });
    resolve();
  });
  const slackAnnouncement = new Promise((resolve, reject) => {
    needle.post('https://vandyhacks-slackbot.herokuapp.com/api/announcements/loudspeaker', { msg: `${req.body.header}: ${req.body.value}` }, { json: true }, function (error, response) {
      if (!error && response.statusCode == 200) {
        resolve();
      } else {
        reject("Did not manage to post announcement to slack")
      }
    });
  })
  Promise.all([chromePush, slackAnnouncement])
    .then(() => {
      const announcement = [payload];
      wss.clients.forEach((client) => {
        client.send(announcement);
      });
      console.log(`Announcement sent through ws: ${announcement}`);
      res.sendStatus(200);
    })
    .catch((error) => {
      console.log(`Error: ${error.stack}`);
      res.sendStatus(500);
    });
});

app.post('/getmsgs', (req, res) => {
  Message.find({}).sort({ field: 'asc', _id: -1 }).exec((err, docs) => {
    if (err) {
      console.log('Error', err);
      res.sendStatus(500);
      return;
    }
    res.send(docs);
  });
});

module.exports = app;
