const source = require('./index');

console.log('Loaded service worker!');

window.self.addEventListener('push', (ev) => {
  const data = ev.data.json();
  console.log('Got push', data);
  window.self.registration.showNotification(data.title, {
    body: source.message,
  });
});
