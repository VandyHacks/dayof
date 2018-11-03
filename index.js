const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const parser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio')(process.env.TWILIO_LIVE_SID, process.env.TWILIO_LIVE_AUTH);
const needle = require('needle');
const webpush = require('web-push');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Push = require('./schemas/schemas').pushSchema;
const Hack = require('./schemas/schemas').hackerSchema;
const Msg = require('./schemas/schemas').msgSchema;
const fetch = require('node-fetch');

const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const publicVapidKey = process.env.WEBPUSH_PUBLIC;
const privateVapidKey = process.env.WEBPUSH_PRIVATE;
const ttl = 600;
const app = express();

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());

app.use(helmet());
app.use(express.static('dist'));

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

const token = process.env.TOKEN;

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
}).listen(PORT);

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('Client connected');
  let isAlive = true;
  ws.ping('ping');
  ws.on('pong', () => {
    ws.ping('ping');
  });
  const keepAlive = setInterval(() => {
    if (ws.readyState !== 1 || !isAlive) {
      clearInterval(keepAlive);
      ws.terminate();
    }
  }, 5000);
  ws.on('close', () => {
    isAlive = false;
    console.log('Breaking connection');
  })
});

app.get('/login', (req, res) => {
  res.sendFile(`${__dirname}/dist/auth.html`);
});

app.get('/admin', (req, res) => {
  res.sendFile(`${__dirname}/dist/admin.html`);
});

async function authorizedJSONFetch(url) {
  const res = await fetch(url, {
    headers: {
      'x-event-secret': token,
    },
  });
  return await res.json();
}

async function setToken() {
  try {
    const res = await fetch('https://apply.vandyhacks.org/auth/eventcode/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
      })
    });
    if (!res.ok) {
      console.log('Invalid token');
    }
    await fetchUserData();
  } catch (err) {
    return console.error(err);
  }
}

const phoneArr = [];
const API_URL = "https://apply.vandyhacks.org/api";
let smsMsg = '';

async function fetchUserData() {
  const USERS_URL = `${API_URL}/users/phoneNums`;
  try {
    const json = await authorizedJSONFetch(USERS_URL)
    const users = json.users;
    console.log('JSON: ', json);
    console.log('Users: ', users);
    users.forEach((user) => {
      let num = user.confirmation.phoneNumber;
      num = num.replace(/-/g, '');
      if (!phoneArr.includes(num)) {
        phoneArr.push(num);
      }
    });
    phoneArr.forEach(number => twilio.messages.create({
      to: number,
      from: process.env.TWILIO_MASS_SMS_SID,
      body: `VandyHacks: ${smsMsg}`,
    }));
  }
  catch (err) {
    return console.error(err);
  }
}

app.post('/admin', (req, res) => {
  if (req.body.password !== process.env.PASSWORD) {
    res.sendStatus(403);
    return;
  }
  smsMsg = req.body.msg;
  setToken();
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
  // if (req.body.password !== process.env.PASSWORD) {
  //   res.sendStatus(403);
  //   return;
  // }

  // const d = new Date();
  // const newMsg = new Message({ header: req.body.header, msg: req.body.value, time: d });
  // newMsg.save()
  //   .catch((err) => {
  //     console.log('Unable to save message to database: ', err);
  //   });
  // // Resource created successfully
  // const payload = JSON.stringify({ title: `VandyHacks: ${req.body.header}`, body: req.body.value, time: d });
  // const options = {
  //   TTL: ttl,
  // };
  // console.log(payload);
  // const chromePush = new Promise((resolve, reject) => {
  //   PushSub.find({}, (err, data) => {
  //     if (err) reject(err);
  //     data.forEach((element) => {
  //       console.log('Data: ', element);
  //       webpush.sendNotification(element, payload, options);
  //     });
  //   });
  //   resolve();
  // });
  // const slackAnnouncement = new Promise((resolve, reject) => {
  //   needle.post('https://vandyhacks-slackbot.herokuapp.com/api/announcements/loudspeaker', { msg: `${req.body.header}: ${req.body.value}` }, { json: true }, (error, response) => {
  //     if (!error && response.statusCode == 200) {
  //       console.log('works');
  //       resolve();
  //     } else {
  //       console.log('does not work');
  //       reject('Did not manage to post announcement to slack');
  //     }
  //   });
  // });
  // Promise.all([slackAnnouncement, chromePush])
  //   .then(() => {
  //     const wsMsg = JSON.stringify({
  //       header: req.body.header,
  //       msg: req.body.value,
  //       time: d,
  //     });
  //     wss.clients.forEach((client) => {
  //       client.send(wsMsg, (err) => {
  //         console.log('ws send err:', err);
  //         client.terminate();
  //       });
  //     });
  //     console.log(`Announcement sent through ws: ${wsMsg}`);
  //     res.sendStatus(201);
  //   })
  //   .catch((error) => {
  //     console.log(`WEBSOCKET SEND ERROR: ${error}`);
  //     res.sendStatus(500);
  //   });
});

app.post('/getmsgs', (req, res) => {
  console.log('Getting previous announcements');
  Message.find({}).sort({ field: 'asc', _id: -1 }).exec((err, docs) => {
    if (err) {
      console.log('Error', err);
      res.sendStatus(500);
      return;
    }
    res.send(docs);
  });
});

app.post('/login', (req, res) => {
  console.log(req);
  if (req === process.env.PASSWORD) {
    res.send(true);
  } else {
    res.send(false);
  }
})

module.exports = app;
