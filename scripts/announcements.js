import React from 'react';
import ReactDOM from 'react-dom';
import { List } from 'immutable';
import Timeago from 'react-timeago';

console.log('Announcements.js Loaded');

class Announcements extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      announcements: List(),
    }
    this.ws;

    this.readTextFile.bind(this);
    this.connectToWebSocket.bind(this);
  }

  readTextFile() {
    let rawFile = new XMLHttpRequest();
    rawFile.open('GET', f, false);
    rawFile.onreadystatechange = () => {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status === 0) {
          let text = rawFile.responseText;
          alert(text);
        }
      }
    }
    rawFile.send(null);
  }

  connectToWebSocket() {
    const HOST = 'wss://vandyhacksnotifications.herokuapp.com/';
    this.ws = new WebSocket(HOST);

    this.ws.onmessage = event => {
      console.log(`event.data=${event.data}`);
      let msg;
      if (event.data === 'reload') {
        console.log('Message sent, reload page');
        window.location.reload();
      } else {
        msg = JSON.parse(event.data);
      }

      this.setState(curState => {
        announcements: List(msg, ...curState.announcements)
      });

      this.ws.onclose = this.connectToWebSocket;
    }
  }

  componentDidMount() {
    this.connectToWebSocket();
  }

  render() {
    return <ul className="announcements-col container-fluid" id="announcements-col">
      {this.state.announcements.map((msg, index) => {
        <li key={ index } className='message'>
          <Timeago className='announcement-when' date={msg.time} />
          <span className='announcement-what'>{msg.msg}</span>
        </li>
      })}
    </ul>
  }
}

const container = document.getElementById('announcements');
ReactDOM.render(<Announcements />, container);
