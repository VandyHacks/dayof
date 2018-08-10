console.log('Accessed adminclient.js');

sessionStorage.setItem('message', '');
sessionStorage.setItem('submitted', false);

// Send Push
function run() {
  console.log('Sending push');
  document.getElementById('pushnotif').onclick = () => {
    if (document.getElementById('msg').value !== '') {
      if (window.confirm('Send message?')) {
        alert('Messages sent!');
        sessionStorage.setItem('message', document.getElementById('msg').value);
        sessionStorage.setItem('submitted', true);
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
