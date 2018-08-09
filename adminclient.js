console.log('Accessed adminclient.js');

// Send Push
async function run() {
  console.log('Sending push');
  document.getElementById('pushnotif').onclick = () => {
    if (document.getElementById('msg').value !== '') {
      if (window.confirm('Send message?')) {
        alert('Messages sent!');
        fetch('/sendpush', {
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
