const publicVapidKey = process.env.WEBPUSH_PUBLIC;

console.log('Accessed client.js');

const pushCheck = document.querySelector('.notifs');
// const submitBtn = document.querySelector('.btn');

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

// Register SW, Register Push, Send Push
async function run() {
  // Register Service Worker
  console.log('Registering service worker');
  const registration = await navigator.serviceWorker
    .register('./worker.js', { scope: '/' });
  console.log('Registered service worker');

  // Register Push
  console.log('Registering push');
  const subscription = await registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
  console.log('Registered push');

  // Send Push Notification
  console.log('Sending push');
  await fetch('/dayof', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'content-type': 'application/json',
    },
  });
  console.log('Sent push');
}

// Check for service worker
function startPush() { // eslint-disable-line no-unused-vars
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push are supported');
    if (pushCheck.checked) {
      run().catch(error => console.error(error));
    }
  } else {
    console.warn('Push notifications not supported');
  }
}

/* submitBtn.addEventListener('click', () => {
  console.log('Checkpoint');
  if (document.getElementById('msg').value !== '') {
    if (window.confirm('Send message?')) {
      alert('Messages sent!');
      startPush();
    }
  }
}); */
