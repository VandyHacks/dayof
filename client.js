console.log('Accessed client.js');

const publicKey = 'BLG1-QasBcbWCAShq_GBT-H_Dmb4gdR3pjUyBhzHYNrPjkoJcQgwHut_D3MGL0c6mbM3BPreabClVFMGPQHx9h0';
const ttl = 30;

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
    .subscribe(options);
  console.log('Registered push');

  // sendSubtoExpress(subscription);

  // Send Push Notification
  console.log('Sending push');
  console.log('PushSubscription: ', JSON.stringify(subscription));
  document.getElementById('pushnotif').onclick = () => {
    if (document.getElementById('msg').value !== '') {
      if (window.confirm('Send message?')) {
        alert('Messages sent!');
        fetch('/dayof', {
          method: 'POST',
          body: JSON.stringify({
            subscribe: subscription,
            timeout: ttl,
          }),
          headers: {
            'Content-type': 'application/json',
          },
        });
      }
    }
  };
  /* document.getElementById('pushtest').onclick = await fetch('/dayof', {
    method: 'POST',
    body: JSON.stringify({
      subscribe: subscription,
      timeout: ttl,
    }),
    headers: {
      'Content-type': 'application/json',
    },
  }); */
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
