
import { Link, withRouter } from 'react-router-dom'
import Cookies from 'js-cookie'

import './index.css'

const Header = props => {
    const onClickLogout = () => {
        Cookies.remove('jwt_token')
        const { history } = props
        history.replace('/login')
    }

    return (
        <nav className="nav-header">
            <div className="nav-content">
                <Link to="/">
                    <img
                        className="website-logo"
                        src={`${process.env.PUBLIC_URL || ''}/logo.svg`}
                        alt="Twitter"
                    />
                </Link>
                <ul className="nav-menu">
                    <Link to="/" className="nav-link">
                        <li>Home</li>
                    </Link>
                    <Link to="/profile" className="nav-link">
                        <li>Profile</li>
                    </Link>
                </ul>
                <button
                    type="button"
                    className="logout-desktop-btn"
                    onClick={onClickLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}

export default withRouter(Header)
