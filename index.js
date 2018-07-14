const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const parser = require('body-parser');
const twilio = require('twilio')(process.env.TWILIO_LIVE_SID, process.env.TWILIO_LIVE_AUTH);
const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const app = express();

app.use(parser.urlencoded({ extended: true }))
app.use(parser.json())

app.use(helmet());
app.use(express.static('VandyHacksNotification'));
 
mongoose.connect(uri);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log("Database open");
})

let phoneArr = [];

const hackerSchema = new mongoose.Schema({
  firstName: {type: String, max: 20},
  lastName: {type: String, max: 20},
  school: {type: String, max: 50},
  email: {type: String, max: 100},
  phone: {type: String, max: 15}
})
const Hacker = db.model("Hacker", hackerSchema);

Hacker.find({}, (err, data) => {
  if (err) throw err;
  data.forEach(function (element) {
    element.phone = element.phone.replace(/-/g,'');
    phoneArr.push(element.phone);
  });
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/form.html");
  console.log("Page loaded");
})

app.post('/', (req, res) => {
  Promise.all(
    phoneArr.map(number => {
      return twilio.messages.create({
        to: number,
        from: process.env.TWILIO_MASS_SMS_SID,
        body: 'VandyHacks: ' + req.body.msg
      })
    })
  )
  .then(messages => {
    res.redirect('back');
  })
  .catch(err => {
    console.log(err);
    res.redirect('back');
  })
})

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
})
