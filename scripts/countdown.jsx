import React from 'react';
import ReactDom from 'react-dom';
import '../styles/countdown.css';

class Countdown extends React.Component {

  componentDidMount() {
    this.updateTime();
    setInterval(this.updateTime, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateTime = () => {
    const end =  new Date(2018, 10, 4, 12);
    const now = new Date();
    const diff = end !== now ? end.getTime() - now.getTime() : 0;
    let hours = Math.floor(diff / (1000 * (60 ** 2)));
    let minutes = Math.floor((diff % (1000 * (60 ** 2))) / (1000 * 60));
    let seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hours = hours < 10 ? `0${hours}` : `${hours}`;
    minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    this.setState({
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    });
  }

  render() {
    return
      <div id="countdown" className="countdown">
        <div id="remaining">
          <b>Time<br />Remaining</b>
        </div>
        <div id="labels">
          HOUR
          <div id="hours" className="time">
            
          </div>
        </div>
        <div id="labels">
          MIN
          <div id="minutes" className="time">
          
          </div>
        </div>
        <div id="labels">
          SEC
          <div id="seconds" className="time">
          
          </div>
        </div>
      </div>
  }
}


const container = document.getElementById('header');
ReactDom.render(<Countdown />, container);
