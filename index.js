const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const uri = process.env.PROD_MONGODB;
const PORT = process.env.PORT || 5000;
const app = express();

app.use(helmet());
app.use(express.static('VandyHacksNotification'));

mongoose.connect(uri);
mongoose.Promise = global.Promise;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log("Database open");
})

var phoneArr = [];

var hackerSchema = new mongoose.Schema({
  firstName: {type: String, max: 20},
  lastName: {type: String, max: 20},
  school: {type: String, max: 20},
  email: {type: String, max: 100},
  phone: {type: String, max: 15}
})
var Hacker = db.model("Hacker", hackerSchema);

Hacker.find({}, (err, data) => {
  if (err) throw err;
  for (let i=0; i<data.length; i++) {
    phoneArr.push(data[i].phone);
  }
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/form.html");
  console.log("Page loaded");
})

app.post('/message', (req, res) => {
  res.send(phoneArr);
})

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
})
