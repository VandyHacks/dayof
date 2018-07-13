# VandyHacksNotifications

Purpose
---
This project is intended to deliver real-time SMS text notifications to hackers during the hackathon.

Spec
---
- Front end: simple form (user inputs text message to send) --> POST to express server
- Server: Reads in list of phone numbers from Mongo DB (mlab.com) - does this when the server is started once only. Each time it gets a POST, it sends SMS to all the phone numbers via Twilio API.
