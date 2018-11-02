import React from 'react';
import '../../assets/scss/Links.scss';

const Links = (props) => {
    return <>
        <h4 className="links-hdr">Important Links</h4>
        <div className="links">
            <div className='links-left'>
                <a href="https://slack.vandyhacks.org">
                    <div className="big-link">
                        <img className="big-link-icon" id="slack" src={require("../../assets/img/slack.svg")} width="40px" height="40px" />
                        <span className="big-link-title">Slack</span>
                    </div>
                </a>
                <a href="https://vandyhacksv.devpost.com">
                    <div className="big-link">
                        <img className="big-link-icon" id="submit" src={require("../../assets/img/devpost.svg")} width="40px" height="40px" />
                        <span className="big-link-title">Submit</span>
                    </div>
                </a>
                <a href="https://hackerguide.vandyhacks.org/">
                    <div className="big-link">
                        <img className="big-link-icon" id="guide" src={require("../../assets/img/book.svg")} width="40px" height="40px" />
                        <span className="big-link-title">Hacker Guide</span>
                    </div>
                </a>
                <a href="https://map.vandyhacks.org">
                    <div className="big-link">
                        <img className="big-link-icon" id="contact" src={require("../../assets/img/map.svg")} width="40px" height="40px" />
                        <span className="big-link-title">Map</span>
                    </div>
                </a>
                <a href="https://help.vandyhacks.org">
                    <div className="big-link">
                        <img className="big-link-icon" id="slack" src={require("../../assets/img/help.svg")} width="40px" height="40px" />
                        <span className="big-link-title">HELPq</span>
                    </div>
                </a>
                <a href="https://music.vandyhacks.org">
                    <div className="big-link">
                        <img className="big-link-icon" id="slack" src={require("../../assets/img/music.svg")} width="40px" height="40px" />
                        <span className="big-link-title">Music</span>
                    </div>
                </a>
            </div>
            <div className='links-right'>
                <a id="fb" href="https://www.facebook.com/vandyhacks/">
                    <div className="small-link">
                        <img src={require("../../assets/img/facebook.svg")} width="40px" height="40px" />
                    </div>
                </a>
                <a id="ig" href="https://instagram.com/vandyhacks/">
                    <div className="small-link">
                        <img src={require("../../assets/img/instagram.svg")} width="40px" height="40px" />
                    </div>
                </a>
                <a id="tw" href="https://twitter.com/vandyhacks">
                    <div className="small-link">
                        <img src={require("../../assets/img/twitter.svg")} width="40px" height="40px" />
                    </div>
                </a>
                <div id="social-media-sell">Follow us on social media to see pictures and videos posted throughout and after the event!</div>
            </div>
        </div>
    </>
}

export default Links;