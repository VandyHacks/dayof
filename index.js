const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const twilio = require('twilio');
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

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/form.html");
  console.log("Page loaded");
})

var client = new twilio(process.env.TWILIO_TEST_SID, process.env.TWILIO_TEST_AUTH);

app.post('/', (req, res) => {
  var text = req.body;
})

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
})
