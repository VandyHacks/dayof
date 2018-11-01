import React from 'react';
import PropTypes from 'prop-types';
import '../../assets/scss/Button.scss';

const Button = (props) => {
    return <div className={'btn-wrapper ' + (props.className || '')} ><a
        href={props.link}
        className={'btn ' + (props.className || '')}
        id={(props.id || '')}>
        {props.text}
    </a></div>
}

export default Button;

Button.propTypes = {
    text: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
}