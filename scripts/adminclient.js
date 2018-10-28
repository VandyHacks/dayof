function checksms() {
  document.getElementById('formdiv').action = document.getElementById('check').checked ? '/admin' : '';
  document.getElementById('formdiv').method = document.getElementById('check').checked ? 'post' : '';
}
console.log('Sending push');
function confirmMsg() {
  if (document.getElementById('msg').value !== '') {
    if (window.confirm('Send message?')) {
      alert('Messages sent!');
      const msgbody = {
        header: document.getElementById('header').value,
        value: document.getElementById('msg').value,
      };
      fetch('/sendpush', {
        method: 'POST',
        body: JSON.stringify(msgbody),
        headers: {
          'Content-type': 'application/json',
        },
      })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return false;
    }
  }
}
