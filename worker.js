console.log('Loaded service worker!');

const request = new XMLHttpRequest();

request.addEventListener('push', (ev) => {
  const data = ev.data.json();
  console.log('Got push', data);
  request.registration.showNotification(data.title, {
    body: data.body,
  });
});
