import React from 'react';
import ReactDOM from 'react-dom';
import '@babel/polyfill';
import AdminForm from './components/AdminForm';
import PasswordPrompt from './components/PasswordPrompt';

class Admin extends React.Component {
    state = {
        password: "",
        passwordReady: false
    }

    updatePasswordReady = (e) => {
        this.setState(curState => {
            return { passwordReady: curState.passwordReady ? false : true }
        })
    }

    render() {
        return <div className='Main'>
            {(this.state.passwordReady)
                ? <AdminForm
                    password={this.state.password}
                    updatePasswordReady={this.updatePasswordReady}
                />
                : <PasswordPrompt
                    updatePassword={(e) => {
                        this.setState({
                            password: e.target.value
                        })
                    }}
                    updatePasswordReady={this.updatePasswordReady}
                />}
        </div>
    }
}

let AppEl = document.getElementById("App");
ReactDOM.render(<Admin />, AppEl);