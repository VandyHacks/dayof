const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio')(process.env.TWILIO_LIVE_SID, process.env.TWILIO_LIVE_AUTH);
const needle = require('needle');
const webpush = require('web-push');
const WebSocket = require('ws');
const fs = require('file-system');
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

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database open');
});

const phoneArr = [];
let jsontable = {
  msgs: [],
};

const Hacker = db.model('Hacker', Hack);
const PushSub = db.model('PushSubscription', Push);
const Message = db.model('Message', Msg);

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

const server = app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/dayof.html`);
  console.log('Live notifications page loaded');
})
  .listen(PORT);

function heartbeat() {
  this.isAlive = true;
}

let connect;
let loggedin = false;

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('Client connected');
  const wscopy = ws;
  connect = ws;
  wscopy.isAlive = true;
  wscopy.ping('pingdata');
  wscopy.on('pong', heartbeat);
  const keepAlive = setInterval(() => {
    if (wscopy.readyState !== 1 || !wscopy.isAlive) {
      clearInterval(keepAlive);
      wscopy.terminate();
    } else {
      wscopy.ping('pingdata');
    }
  }, 5000);
  ws.on('close', () => {
    wscopy.isAlive = false;
    console.log('Client disconnected');
  });
});

app.get('/login', (req, res) => {
  res.sendFile(`${__dirname}/auth.html`);
  console.log('Login page loaded');
});

app.get('/admin', (req, res) => {
  if (!loggedin) {
    res.redirect('/login');
  } else {
    res.sendFile(`${__dirname}/admin.html`);
    console.log('Admin page loaded');
  }
});

app.post('/login', (req, res) => {
  if (req.body.password === process.env.PASSWORD) {
    loggedin = true;
    res.redirect('/admin');
    console.log('Logged in');
  } else {
    res.redirect('/login');
  }
});

setTimeout(() => {
  if (loggedin) {
    loggedin = false;
  }
}, 300000);

app.post('/admin', (req, res) => {
  const smsMsg = new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
    phoneArr.map(number => twilio.messages.create({
      to: number,
      from: process.env.TWILIO_MASS_SMS_SID,
      body: `VandyHacks: ${req.body.msg}`,
    }));
    resolve();
  });
  Promise.all([smsMsg])
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
  const payload = JSON.stringify({ title: `VandyHacks: ${req.body.header}`, body: req.body.value });
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
    needle.post('https://vandyhacks-slackbot.herokuapp.com/api/announcements/loudspeaker', {msg: `${req.body.header}: ${req.body.value}`}, {json:true}, function(error, response) {
        if (!error && response.statusCode == 200) {
            resolve();
        } else {
            reject("Did not manage to post announcement to slack")
        }
      });
})
  Promise.all([chromePush,slackAnnouncement])
    .then(
      console.log('Push notification sent'),
      wss.clients.forEach((client) => {
        client.send('reload');
      }),
      res.sendStatus(201),
    )
    .catch((error) => {
      console.log(error.stack);
    });

  const d = new Date();
  const newMsg = new Message({ header: req.body.header, msg: req.body.value, time: d });
  newMsg.save()
    .catch((err) => {
      console.log('Unable to save message to database: ', err);
    });
  fs.readFile('pastnotifs.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      jsontable = JSON.parse(data);
      jsontable.msgs.push({
        heading: req.body.header,
        text: req.body.value,
        time: d,
      });
      const json = JSON.stringify(jsontable);
      fs.writeFile('pastnotifs.json', json, 'utf8');
    }
  });
});

app.post('/updatemsg', (req, res) => {
  const promise = new Promise((resolve, reject) => {
    Message.find({}, (err, docs) => {
      if (err) reject(err);
      wss.clients.forEach((client) => {
        if (client === connect) {
          client.send(JSON.stringify(docs.slice(-1)));
          console.log('Data sent to client');
        }
      });
    });
    resolve();
  });

  Promise.all([promise])
    .then(res.sendStatus(201))
    .catch((error) => {
      console.log(error);
    });
});

module.exports = app;
