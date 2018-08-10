console.log('Accessed adminclient.js');

// Send Push
function run() {
  console.log('Sending push');
  document.getElementById('pushnotif').onclick = async () => {
    if (document.getElementById('msg').value !== '') {
      if (window.confirm('Send message?')) {
        alert('Messages sent!');
        await fetch('/', {
          method: 'POST',
          body: document.getElementById('msg').value,
        });
        await fetch('/sendpush', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
        });
      }
    }
  };
  console.log('Sent push');
}

// Check for service worker
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push are supported');
  run().catch(error => console.error(error));
} else {
  console.warn('Push notifications not supported');
}
