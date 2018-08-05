console.log('Loaded service worker!');


self.addEventListener('push', (ev) => { // eslint-disable-line no-restricted-globals
  const data = ev.data.json();
  console.log('Got push', data);
  self.registration.showNotification(data.title, { // eslint-disable-line no-restricted-globals
    body: data.body,
  });
});
