import React from 'react';
import '../../assets/scss/Links.scss';

const Links = (props) => {
    return <>
        <h4 className="links-hdr">Important Links</h4>
        <div className="links">
            <div className='links-left'>
                <div className="big-link">
                    <a href="https://slack.vandyhacks.org">
                        <img className="big-link-icon" id="slack" src={require("../../assets/img/slack.svg")} width="60px" height="60px" />
                        <span className="big-link-title">Slack</span>
                    </a>
                </div>
                <div className="big-link">
                    <a href="https://vandyhacksv.devpost.com">
                        <img className="big-link-icon" id="submit" src={require("../../assets/img/devpost.svg")} width="60px" height="60px" />
                        <span className="big-link-title">Submit</span>
                    </a>
                </div>
                <div className="big-link">
                    <a href="https://hackerguide.vandyhacks.org/#wifi-electronics-&-hardware">
                        <img className="big-link-icon" id="guide" src={require("../../assets/img/book.svg")} width="50px" height="50px" />
                        <span className="big-link-title">Hacker Guide</span>
                    </a>
                </div>
                <div className="big-link">
                    <a href="https://hackerguide.vandyhacks.org/#emergencies">
                        <img className="big-link-icon" id="contact" src={require("../../assets/img/contact.svg")} width="60px" height="60px" />
                        <span className="big-link-title">Contact</span>
                    </a>
                </div>
            </div>
            <div className='links-right'>
                <div className="small-link">
                    <a id="fb" href="https://www.facebook.com/vandyhacks/">
                        <img src={require("../../assets/img/facebook.svg")} width="40px" height="40px" />
                    </a>
                </div>
                <div className="small-link">
                    <a id="ig" href="https://instagram.com/vandyhacks/">
                        <img src={require("../../assets/img/instagram.svg")} width="40px" height="40px" />
                    </a>
                </div>
                <div className="small-link">
                    <a id="tw" href="https://twitter.com/vandyhacks">
                        <img src={require("../../assets/img/twitter.svg")} width="40px" height="40px" />
                    </a>
                </div>
                <div id="social-media-sell">Follow us on social media to see pictures and videos posted throughout and after the event!</div>
            </div>
        </div>
    </>
}

export default Links;