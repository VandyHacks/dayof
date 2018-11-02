# VandyHacksNotifications

Purpose
---
This project is intended to deliver real-time SMS text and web push notifications and to hackers during the hackathon.

Spec
---
- Front end: 
    - Simple form (user inputs text message to send) --> POST to express server
    - Requests permission for notifications, registers service worker, registers push
    - Update live notifications page with message
- Server: 
    - Reads in list of phone numbers from Mongo DB (mlab.com) - does this when the server is started once only. Each time it gets a POST, it sends SMS to all the phone numbers via Twilio API.
    - Adds PushSubscription object to Mongo DB (checking for existence) upon visiting live notifications page. Push notifications are sent based on PushSubscription endpoints and keys. 