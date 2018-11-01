import React from 'react'
import PropTypes from 'prop-types';
import '../../assets/scss/Countdown.scss'

export class CountdownTimer extends React.Component {
    componentWillMount() {
        this.updateTime();
        this.interval = setInterval(this.updateTime, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    // setTimeout call at end will keep running this in a loop every second
    updateTime = () => {
        const now = new Date().getTime();
        const end = (this.props.firstEnd.getTime() > now || this.props.secondEnd == undefined)
            ? this.props.firstEnd.getTime()
            : this.props.secondEnd.getTime();
        const text = (this.props.firstEnd.getTime() > now || this.props.secondEnd == undefined)
            ? this.props.firstText
            : this.props.secondText;
        const diff = end > now ? end - now : 0;

        let hours = Math.floor(diff / (1000 * (60 ** 2)));
        let minutes = Math.floor((diff % (1000 * (60 ** 2))) / (1000 * 60));
        let seconds = Math.floor((diff % (1000 * 60)) / 1000);

        hours = hours < 10 ? `0${hours}` : `${hours}`;
        minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

        this.setState({
            text: text,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        });
    }

    render() {
        return <div className="countdown" >
            <div className="remaining" dangerouslySetInnerHTML={{ __html: this.state.text }} />
            <div className="labels" id="hour">
                HOUR
            </div>
            <div className="time">
                {this.state.hours}
            </div>
            <div className="labels" id="min">
                MIN
            </div>
            <div className="time">
                {this.state.minutes}
            </div>
            <div className='labels' id="sec">
                SEC
            </div>
            <div className="time">
                {this.state.seconds}
            </div>
        </div>
    }
};

CountdownTimer.propTypes = {
    firstEnd: PropTypes.instanceOf(Date).isRequired,
    secondEnd: PropTypes.instanceOf(Date),
    firstText: PropTypes.string.isRequired,
    secondText: PropTypes.string,
}