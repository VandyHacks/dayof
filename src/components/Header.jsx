import React from 'react';
import PropTypes from 'prop-types';
import { CountdownTimer } from './CountdownTimer';
import VHLogo from './svg/VHLogo';

export const Header = (props) => {
    return <div className="header">
        <VHLogo />
        <CountdownTimer
            firstEnd={props.firstEnd}
            firstText={props.firstText}
            secondEnd={props.secondEnd}
            secondText={props.secondText}
        />
    </div>
}

Header.propTypes = {
    firstEnd: PropTypes.instanceOf(Date).isRequired,
    secondEnd: PropTypes.instanceOf(Date),
    firstText: PropTypes.string.isRequired,
    secondText: PropTypes.string,
}