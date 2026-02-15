
import { Component } from 'react'
import Cookies from 'js-cookie'
import { ThreeDots } from 'react-loader-spinner'
import Header from '../Header'
import './index.css'

const apiStatusConstants = {
    initial: 'INITIAL',
    success: 'SUCCESS',
    failure: 'FAILURE',
    inProgress: 'IN_PROGRESS',
}

class Following extends Component {
    state = {
        followingList: [],
        apiStatus: apiStatusConstants.initial,
    }

    componentDidMount() {
        this.getFollowing()
    }

    getFollowing = async () => {
        this.setState({ apiStatus: apiStatusConstants.inProgress })
        const jwtToken = Cookies.get('jwt_token')
        const url = `${process.env.REACT_APP_API_BASE_URL}/user/following/`
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
                id: eachUser.id || Math.random().toString(), // API might not return ID, using name
            }))
            this.setState({
                followingList: updatedData,
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
            <p>Failed to load following list</p>
            <button type="button" className="retry-button" onClick={this.getFollowing}>
                Retry
            </button>
        </div>
    )

    renderFollowingListView = () => {
        const { followingList } = this.state
        if (followingList.length === 0) {
            return (
                <div className="no-data-view">
                    <p>You are not following anyone yet.</p>
                </div>
            )
        }
        return (
            <ul className="user-list">
                {followingList.map((user, index) => (
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
                return this.renderFollowingListView()
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
                        <h1 className="list-heading">Following</h1>
                        {this.renderContent()}
                    </div>
                </div>
            </>
        )
    }
}

export default Following
