
import { Component } from 'react'
import Cookies from 'js-cookie'
import { ThreeDots } from 'react-loader-spinner'
import Header from '../Header'
import './index.css' // Reusing CSS if possible or create new

const apiStatusConstants = {
    initial: 'INITIAL',
    success: 'SUCCESS',
    failure: 'FAILURE',
    inProgress: 'IN_PROGRESS',
}

class Followers extends Component {
    state = {
        followersList: [],
        apiStatus: apiStatusConstants.initial,
    }

    componentDidMount() {
        this.getFollowers()
    }

    getFollowers = async () => {
        this.setState({ apiStatus: apiStatusConstants.inProgress })
        const jwtToken = Cookies.get('jwt_token')
        const url = `${process.env.REACT_APP_API_BASE_URL}/user/followers/`
        const options = {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
            method: 'GET',
        }
        const response = await fetch(url, options)
        if (response.ok === true) {
            const data = await response.json()
            const updatedData = data.map(eachUser => ({
                name: eachUser.name,
                id: eachUser.id || Math.random().toString(),
            }))
            this.setState({
                followersList: updatedData,
                apiStatus: apiStatusConstants.success,
            })
        } else {
            this.setState({ apiStatus: apiStatusConstants.failure })
        }
    }

    renderLoadingView = () => (
        <div className="loader-container">
            <ThreeDots type="ThreeDots" color="#0b69ff" height="50" width="50" />
        </div>
    )

    renderFailureView = () => (
        <div className="failure-view-container">
            <p>Failed to load followers list</p>
            <button type="button" className="retry-button" onClick={this.getFollowers}>
                Retry
            </button>
        </div>
    )

    renderFollowersListView = () => {
        const { followersList } = this.state
        if (followersList.length === 0) {
            return (
                <div className="no-data-view">
                    <p>You have no followers yet.</p>
                </div>
            )
        }
        return (
            <ul className="user-list">
                {followersList.map((user, index) => (
                    <li className="user-item" key={index}>
                        <div className="user-pic-container">
                            <p className="user-pic-text">{user.name[0].toUpperCase()}</p>
                        </div>
                        <p className="user-list-name">{user.name}</p>
                    </li>
                ))}
            </ul>
        )
    }

    renderContent = () => {
        const { apiStatus } = this.state

        switch (apiStatus) {
            case apiStatusConstants.success:
                return this.renderFollowersListView()
            case apiStatusConstants.failure:
                return this.renderFailureView()
            case apiStatusConstants.inProgress:
                return this.renderLoadingView()
            default:
                return null
        }
    }

    render() {
        return (
            <>
                <Header />
                <div className="list-container-main">
                    <div className="list-content-container">
                        <h1 className="list-heading">Followers</h1>
                        {this.renderContent()}
                    </div>
                </div>
            </>
        )
    }
}

export default Followers
