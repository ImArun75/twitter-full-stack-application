
import { Component } from 'react'
import { Link } from 'react-router-dom'

import './index.css'

class Register extends Component {
    state = {
        username: '',
        password: '',
        name: '',
        gender: 'Male',
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

    onChangeName = event => {
        this.setState({ name: event.target.value })
    }

    onChangeGender = event => {
        this.setState({ gender: event.target.value })
    }

    onSubmitSuccess = () => {
        const { history } = this.props
        history.replace('/login')
    }

    onSubmitFailure = errorMsg => {
        this.setState({ showSubmitError: true, errorMsg })
    }

    submitForm = async event => {
        event.preventDefault()
        this.setState({ showSubmitError: false, isLoading: true })
        const { username, password, name, gender } = this.state
        const userDetails = { username, password, name, gender }
        const url = `${process.env.REACT_APP_API_BASE_URL}/register/`
        const options = {
            method: 'POST',
            body: JSON.stringify(userDetails),
            headers: {
                'Content-Type': 'application/json',
            },
        }
        try {
            const response = await fetch(url, options)
            const data = await response.text()
            if (response.ok === true) {
                this.onSubmitSuccess()
            } else {
                this.onSubmitFailure(data || 'Registration failed')
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

    renderNameField = () => {
        const { name } = this.state
        return (
            <>
                <label className="input-label" htmlFor="name">
                    NAME
                </label>
                <input
                    type="text"
                    id="name"
                    className="username-input-filed"
                    value={name}
                    onChange={this.onChangeName}
                    placeholder="Name"
                />
            </>
        )
    }

    renderGenderField = () => {
        const { gender } = this.state
        return (
            <>
                <label className="input-label" htmlFor="gender">
                    GENDER
                </label>
                <select
                    id="gender"
                    className="username-input-filed"
                    value={gender}
                    onChange={this.onChangeGender}
                >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </>
        )
    }

    render() {
        const { showSubmitError, errorMsg } = this.state
        return (
            <div className="login-form-container">
                <form className="form-container" onSubmit={this.submitForm}>
                    <img
                        src={`${process.env.PUBLIC_URL || ''}/logo.svg`}
                        className="login-website-logo-desktop-image"
                        alt="Twitter"
                    />
                    <div className="input-container">{this.renderNameField()}</div>
                    <div className="input-container">{this.renderUsernameField()}</div>
                    <div className="input-container">{this.renderPasswordField()}</div>
                    <div className="input-container">{this.renderGenderField()}</div>
                    <button type="submit" className="login-button" disabled={this.state.isLoading}>
                        {this.state.isLoading ? 'Registering...' : 'Register'}
                    </button>
                    {showSubmitError && <p className="error-message">*{errorMsg}</p>}
                    <Link to="/login" className="link-item">
                        <p className="login-link">Already have an account? Login</p>
                    </Link>
                </form>
            </div>
        )
    }
}

export default Register
