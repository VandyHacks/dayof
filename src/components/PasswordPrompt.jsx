import React from 'react';

const PasswordPrompt = (props) => {
    return <div className="container center-block">
        <div className="row center-block">
            <form action="/login" className="justify-content-center" method="post">
                <div className="form-group">
                    <label>Password:</label><br />
                    <input onChange={props.updatePassword} type="password" name="password" />
                    <input onClick={props.updatePasswordReady} type="submit" value="Submit" />
                </div>
            </form>
        </div>
    </div>
}

export default PasswordPrompt;