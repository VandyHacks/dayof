console.log('Accessed client.js');

const publicKey = process.env.PUBLIC_VAPID_KEY;
const ttl = 10;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/* function sendSubtoExpress(sub) {
  return fetch('/savesub', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sub),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Bad response from server.');
      }
    });
} */

// Register SW, Register Push, Send Push
async function run() {
  // Register Service Worker
  console.log('Registering service worker');
  const registration = await navigator.serviceWorker
    .register('./worker.js', { scope: '/' })
    .catch((err) => {
      console.log(err);
    });
  // swRegistration = registration;
  // initializeUI();
  console.log('Registered service worker');

  // Register Push
  console.log('Registering push');
  const subscription = await registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  console.log('Registered push');

  // sendSubtoExpress(subscription);

  // Send Push Notification
  console.log('Sending push');
  console.log('PushSubscription: ', JSON.stringify(subscription));
  await fetch('/dayof', {
    method: 'POST',
    body: JSON.stringify({
      subscribe: subscription,
      timetolive: ttl,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  });
  console.log('Sent push');
}

function requestPermission() {
  return new Promise((resolve, reject) => {
    const permissionResult = Notification.requestPermission((result) => {
      resolve(result);
    });
    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  })
    .then((permissionResult) => {
      if (permissionResult !== 'granted') {
        throw new Error('Permission not granted.');
      }
    });
}

// Check for service worker
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push are supported');
  requestPermission();
  run().catch(error => console.error(error));
} else {
  console.warn('Push notifications not supported');
}
