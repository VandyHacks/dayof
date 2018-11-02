import React from 'react';
import ReactDOM from 'react-dom';
import { List } from 'immutable';
import Timeago from 'react-timeago';
import '../../assets/scss/Announcements.scss';

class Announcements extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      announcements: List(),
    }
    this.ws;
  }

  getMsgsFromDB = async () => {
    const res = await fetch('https://vandyhacksnotifications.herokuapp.com/getmsgs', {
      method: 'post',
    });
    const msgs = await res.json();

    this.setState({
      announcements: List(msgs)
    });
  }

  connectToWebSocket = () => {
    const HOST = 'wss://vandyhacksnotifications.herokuapp.com/';
    this.ws = new WebSocket(HOST);

    this.ws.onmessage = event => {
      let msg;
      if (event.data === 'reload') {
        window.location.reload();
      } else {
        msg = JSON.parse(event.data);
      }

      console.log(msg);

      this.setState(curState => {
        return {
          announcements: curState.announcements.unshift(msg)
        }
      });

      this.ws.onclose = this.connectToWebSocket;
    }
  }

  componentWillMount() {
    this.getMsgsFromDB();
    this.connectToWebSocket();
  }

  render() {
    return <>
      <h4 className="announcements-hdr">Live Announcements</h4>
      <ul className="announcements-col">
        {this.state.announcements.map((m, i) => {
          return <Announcement
            key={i}
            time={m.time}
            header={m.header}
            msg={m.msg}
            class={i === 0 ? 'main-msg' : 'side-msg'} />
        })}
      </ul>
    </>
  }
}

const Announcement = (props) => {
  return <li className='message'>
    <Timeago className='when' date={props.time} />
    <span className='what'>{props.msg}</span>
  </li>
}

export default Announcements;
