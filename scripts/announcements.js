const HOST = window.location.origin.replace(/^https/, 'wss');
const ws = new WebSocket(HOST);
const container = document.getElementById('announcements-col');

class Announcements extends React.Component {
  render() {
    const elements = this.props.messages.map(({time, msg}, index) => {
      const date = new Date(time);
      return (
        <li key={index} className="message">
          <span>{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span>{msg}</span>
        </li>
      );
    })

    elements.reverse();
    return <>{elements}</>;
  }
}

ws.onmessage = event => {
  console.log(`event.data=${event.data}`);
  if (event.data === 'reload') {
    console.log('Message sent, reload page');
    window.location.reload();
  } else {
    const messages = JSON.parse(event.data);
    ReactDOM.render(<Announcements messages={messages}/>, container);
  }
};
