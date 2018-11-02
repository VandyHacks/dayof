import React from 'react';
import '../../assets/scss/Schedule.scss';

const absoluteStart = new Date('November 2, 2018 17:00:00');
const thirtyMinutesMilliseconds = 1000 * 60 * 30;

const events = require('./events.json');
const types = ['MAIN EVENTS', 'FOOD', 'HACKER EXP', 'SPONSOR TALKS'];
const times = ['FRI 6PM', '7PM', '8PM', '9PM', '10PM', '11PM', 'SAT 12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM', 'SUN 12AM', '1AM', '2AM', '3AM', '4AM', '5AM', '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM'];

const Header = (props) => {
  return (
    <div className="container-header-row">
      <div className="header-padding-left"></div>

      <div className="container-header">
        {/* initial gap */}
        <div className="text" id="gap"></div>
        {types.map(type => <>
          <div className="text">{type}</div>
          <div className="text" id="gap"></div>
        </>)}
      </div>

      <div className="header-padding-right"></div>
    </div>
  );
}

const Schedule = (props) => {
  return <>
    <h4 className="schedule-hdr">Schedule</h4>
    <div className="schedule larger-container">
      <Header />
      
      <div className="container-main">
        <div className="container-time">{times.map(time => <div className="text">{time}</div>)}</div>
        <div className="container-body">

        {events.map(event => {
          const start = new Date(event.start.dateTime);
          const end = new Date(event.end.dateTime);
          const chunks = Math.floor((end - start) / thirtyMinutesMilliseconds);

          const rowStart = Math.floor((start - absoluteStart) / thirtyMinutesMilliseconds);
          const rowEnd = rowStart + chunks;
          if (rowStart !== rowEnd) {
            return (
              <div className={`${event.type} item`} style={{
                gridRow: `${rowStart} / ${rowEnd}`,
              }}>
                <p className="heading">{event.summary}</p>
                <span className="description">{event.location}</span>
                <p className="details"></p>
              </div>
            );
          }
        })}
        </div>
      </div>
    </div>
  </>
}

export default Schedule;