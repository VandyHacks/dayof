const HOST = window.location.origin.replace(/^https/, 'wss');
const ws = new WebSocket(HOST);
const el = document.getElementById('announcements-col');

ws.onmessage = function (event) {
  console.log(event.data);
  if (event.data === 'reload') {
    console.log('Message sent, reload page');
    window.location.reload();
  } else if (el.innerHTML === '') {
    el.innerHTML = `<div class="announcements container-fluid">
                      <div class="notiftimes container" id="notiftimes">
                        <div class="notiftimestamp">00:00:00 am</div>
                      </div>
                      <div class="notiftext container-fluid" id="notiftext">
                        <div class="tmptext">Announcements will be posted here</div>
                      </div>
                    </div>`;
  } else {
    const arr = JSON.parse(event.data);
    arr.forEach((element) => {
      const d = new Date(element.time);
      const hours = `${d.getHours() % 12}`;
      const minutes = d.getMinutes() < 10 ? `0${d.getMinutes()}` : `${d.getMinutes()}`;
      const ampm = d.getHours() >= 12 ? 'pm' : 'am';
      const msgstring = `<div class="announcements container">
                          <div class="notiftimes container" id="notiftimes">
                            <div class="notiftimestamp">${hours}:${minutes} ${ampm}</div>
                          </div>
                          <div class="notiftext container" id="notiftext">
                            <div class="notifbody">${element.msg}</div>
                          </div>
                        </div>`;
      el.innerHTML = msgstring + el.innerHTML;
    });
  }
};
