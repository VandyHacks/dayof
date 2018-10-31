import '@babel/polyfill';

console.log('Accessed client.js');

const publicKey = 'BLG1-QasBcbWCAShq_GBT-H_Dmb4gdR3pjUyBhzHYNrPjkoJcQgwHut_D3MGL0c6mbM3BPreabClVFMGPQHx9h0';

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

const options = {
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(publicKey),
};

function sendSubtoExpress(sub) {
  console.log(sub);
  console.log(JSON.stringify(sub));
  return fetch('/savesub', {
    method: 'POST',
    body: JSON.stringify(sub),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      console.log(res);
      if (!res.ok) {
        throw new Error('Bad response from server.');
      }
      return JSON.parse(JSON.stringify(res));
    });
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

// Register SW, Register Push, Send Push
async function run() {
  await requestPermission();

  // Register Service Worker
  console.log('Registering service worker');
  const registration = await navigator.serviceWorker
    .register('./worker.js', { scope: '/' })
    .catch((err) => {
      console.log(err);
    });
  console.log(registration);
  console.log('Registered service worker');

  // Register Push
  console.log('Registering push');
  const subscription = await registration.pushManager
    .subscribe(options);
  console.log('Registered push');

  // Send PushSubscription to backend
  await sendSubtoExpress(subscription);

  fetch('/updatemsg', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-type': 'application/json',
    },
  })
    .then(console.log('Fetched'))
    .catch((err) => {
      console.log('Error fetching: ', err);
    });
}

// Check for service worker
if ('serviceWorker' in navigator && 'PushManager' in window) {
  run().catch(error => console.error(error));
} else {
  console.warn('Push notifications not supported');
}
