import React from 'react';

class AdminForm extends React.Component {
  state = {
    msg: "",
    header: "",
    sms: false,
  }

  handleMsgChange = (e) => {
    this.setState({ msg: e.target.value });
  }

  handleHeaderChange = (e) => {
    this.setState({ header: e.target.value });
  }

  handleSMSChange = (e) => {
    this.setState({ sms: e.target.checked });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (!window.confirm("Send message?")) {
      return;
    }

    if (this.state.sms) {
      fetch('https://vandyhacksnotifications.herokuapp.com/admin', {
        method: 'POST',
        body: JSON.stringify({
          password: this.props.password,
          header: this.state.header,
          msg: this.state.msg,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      }).catch((err) => {
        window.alert(err);
        return;
      });
    }

    fetch('https://vandyhacksnotifications.herokuapp.com/sendpush', {
      method: 'POST',
      body: JSON.stringify({
        password: this.props.password,
        header: this.state.header,
        value: this.state.msg,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    }).catch((err) => {
      window.alert(err);
      return;
    });
  }

  render() {
    return <>
      <nav className="navbar">
        <h1 className="mx-auto navbar-brand">VandyHacks Notifications</h1>
      </nav>
      <div className="container center-block">
        <div className="row center-block">
          <div className="col">
            <form action="/admin" method="post" className="justify-content-center" id="formdiv">
              <div className="form-group">
                <label htmlFor="header">Enter notification header: </label>
                <input type="text" value={this.state.header} onChange={this.handleHeaderChange} className="form-control" id="header" name="header" placeholder="Header here..." />
              </div>
              <div className="form-group">
                <label htmlFor="msg">Enter notification body: </label>
                <textarea value={this.state.msg} onChange={this.handleMsgChange} className="form-control" name="msg" id="msg" rows="5" wrap="soft" placeholder="SMS here..." required></textarea>
              </div>
              <div className="send">
                <div id="send"><input value={this.state.sms} onChange={this.handleSMSChange} type="checkbox" id="check" />
                  <p>Send SMS</p>
                </div>
                <div id="send"><input onClick={this.handleSubmit} type="submit" id="pushnotif" className="btn btn-outline-secondary"
                  value="Send" /><br /></div>
                <div id="logout"><input onClick={this.props.updatePasswordReady} type="submit" className="btn btn-outline-secondary"
                  value="Logout" /><br /></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  }
}

export default AdminForm;