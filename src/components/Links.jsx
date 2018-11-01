import React from 'react';
import '../../assets/scss/Links.scss';

const Links = (props) => {
    return <>
        <h4 className="links-hdr">Important Links</h4>
        <div className="links">
            <div className='links-left'>
                <a href="https://slack.vandyhacks.org" className="big-link">
                    <img className="big-link-icon" id="Slack" src={require("../../assets/img/slack.svg")} />
                    <span className="big-link-title">Slack</span>
                </a>
                <a href="https://vandyhacksv.devpost.com" className="big-link">
                    <img className="big-link-icon" id="Submit" src={require("../../assets/img/devpost.svg")} />
                    <span className="big-link-title">Submit</span>
                </a>
                <a href="https://hackerguide.vandyhacks.org/#wifi-electronics-&-hardware" className="big-link">
                    <img className="big-link-icon" id="guide" src={require("../../assets/img/book.svg")} />
                    <span className="big-link-title">Hacker Guide</span>
                </a>
                <a href="https://hackerguide.vandyhacks.org/#emergencies" className="big-link">
                    <img className="big-link-icon" id="Contact" src={require("../../assets/img/contact.svg")} />
                    <span className="big-link-title">Contact</span>
                </a>
            </div>
            <div className='links-right'>
                <div className='small-links'>
                    <a className="small-link" id="fb" href="https://www.facebook.com/vandyhacks/">
                        <img src={require("../../assets/img/facebook.svg")} width="40px" height="40px" />
                    </a>
                    <a className="small-link" id="ig" href="https://instagram.com/vandyhacks/">
                        <img src={require("../../assets/img/instagram.svg")} width="40px" height="40px" />
                    </a>
                    <a className="small-link" id="tw" href="https://twitter.com/vandyhacks">
                        <img src={require("../../assets/img/twitter.svg")} width="40px" height="40px" />
                    </a>
                </div>
                <div id="social-media-sell">Follow us on social media to see pictures and videos posted throughout and after the event!</div>
            </div>
        </div>
    </>
}

export default Links;