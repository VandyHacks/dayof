import React from 'react';
import ReactDOM from 'react-dom';
import { Header } from './components/Header';
import '../assets/scss/DayOf.scss'
import Button from './components/Button';
import Announcements from './components/Announcements';
import '@babel/polyfill';
import Links from './components/Links';
import Schedule from './components/Schedule';

class DayOf extends React.Component {
    render() {
        return <div className='Main'>
            <Header
                firstEnd={new Date(2018, 10, 2, 21)}
                firstText='Time Until<br/>Hacking Begins'
                secondEnd={new Date(2018, 10, 4, 9)}
                secondText='Time<br/>Remaining' />
            <Announcements />
            <Links />
            <Schedule />
        </div>
    }
}

let AppEl = document.getElementById("App");
ReactDOM.render(<DayOf />, AppEl);