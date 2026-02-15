
import { Component } from 'react'
import Cookies from 'js-cookie'
import { Redirect, Link } from 'react-router-dom'

import './index.css'

class Login extends Component {
    state = {
        username: '',
        password: '',
        showSubmitError: false,
        errorMsg: '',
        isLoading: false,
    }

    onChangeUsername = event => {
        this.setState({ username: event.target.value })
    }

    onChangePassword = event => {
        this.setState({ password: event.target.value })
    }

    onSubmitSuccess = jwtToken => {
        const { history } = this.props
        const { username } = this.state
        Cookies.set('jwt_token', jwtToken, { expires: 30 })
        Cookies.set('user_name', username, { expires: 30 })
        history.replace('/')
    }

    onSubmitFailure = errorMsg => {
        this.setState({ showSubmitError: true, errorMsg })
    }

    submitForm = async event => {
        event.preventDefault()
        this.setState({ showSubmitError: false, isLoading: true })
        const { username, password } = this.state
        const userDetails = { username, password }
        const url = `${process.env.REACT_APP_API_BASE_URL}/login/`
        const options = {
            method: 'POST',
            body: JSON.stringify(userDetails),
            headers: {
                'Content-Type': 'application/json',
            },
        }
        try {
            const response = await fetch(url, options)
            if (response.ok === true) {
                const data = await response.json()
                this.onSubmitSuccess(data.jwtToken)
            } else {
                const errorText = await response.text()
                this.onSubmitFailure(errorText || 'Login failed')
            }
        } catch (_err) {
            this.onSubmitFailure('Network error. Please try again.')
        } finally {
            this.setState({ isLoading: false })
        }
    }

    renderPasswordField = () => {
        const { password } = this.state
        return (
            <>
                <label className="input-label" htmlFor="password">
                    PASSWORD
                </label>
                <input
                    type="password"
                    id="password"
                    className="password-input-filed"
                    value={password}
                    onChange={this.onChangePassword}
                    placeholder="Password"
                />
            </>
        )
    }

    renderUsernameField = () => {
        const { username } = this.state
        return (
            <>
                <label className="input-label" htmlFor="username">
                    USERNAME
                </label>
                <input
                    type="text"
                    id="username"
                    className="username-input-filed"
                    value={username}
                    onChange={this.onChangeUsername}
                    placeholder="Username"
                />
            </>
        )
    }

    render() {
        const { showSubmitError, errorMsg } = this.state
        const jwtToken = Cookies.get('jwt_token')
        if (jwtToken !== undefined) {
            return <Redirect to="/" />
        }
        return (
            <div className="login-form-container">
                <form className="form-container" onSubmit={this.submitForm}>
                    <img
                        src={`${process.env.PUBLIC_URL || ''}/logo.svg`}
                        className="login-website-logo-desktop-image"
                        alt="Twitter"
                    />
                    <div className="input-container">{this.renderUsernameField()}</div>
                    <div className="input-container">{this.renderPasswordField()}</div>
                    <button type="submit" className="login-button" disabled={this.state.isLoading}>
                        {this.state.isLoading ? 'Logging in...' : 'Login'}
                    </button>
                    {showSubmitError && <p className="error-message">*{errorMsg}</p>}
                    <Link to="/register" className="link-item">
                        <p className="login-link">Don't have an account? Register</p>
                    </Link>
                </form>
            </div>
        )
    }
}

export default Login
