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

function run() {
  navigator.serviceWorker.register('worker.js');
  navigator.serviceWorker.ready
    .then((registration) => { // eslint-disable-line
      return registration.pushManager.getSubscription()
        .then(async (subscription) => { // eslint-disable-line
          if (subscription) {
            return subscription;
          }
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        });
    })
    .then((subscription) => {
      fetch('/register', {
        method: 'post',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
      document.getElementById('pushnotif').onclick = () => {
        fetch('/dayof', {
          method: 'post',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });
      };
    });
}

// Check for service worker
// function startPush() { // eslint-disable-line no-unused-vars
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push are supported');
  run().catch(error => console.error(error));
} else {
  console.warn('Push notifications not supported');
}
// }
