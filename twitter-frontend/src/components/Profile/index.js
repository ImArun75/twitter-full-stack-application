
import { Component } from 'react'
import Cookies from 'js-cookie'
import { ThreeDots } from 'react-loader-spinner'
import Header from '../Header'
import TweetItem from '../TweetItem'
import './index.css'

const apiStatusConstants = {
    initial: 'INITIAL',
    success: 'SUCCESS',
    failure: 'FAILURE',
    inProgress: 'IN_PROGRESS',
}

class Profile extends Component {
    state = {
        tweetsList: [],
        apiStatus: apiStatusConstants.initial,
    }

    componentDidMount() {
        this.getProfileData()
    }

    getProfileData = async () => {
        this.setState({ apiStatus: apiStatusConstants.inProgress })
        const jwtToken = Cookies.get('jwt_token')
        const username = Cookies.get('user_name')
        const url = `${process.env.REACT_APP_API_BASE_URL}/user/tweets/`
        const options = {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
            method: 'GET',
        }
        const response = await fetch(url, options)
        if (response.status === 401) {
            Cookies.remove('jwt_token')
            this.props.history.replace('/login')
            return
        }
        if (response.ok === true) {
            const data = await response.json()
            const updatedData = data.map(eachTweet => ({
                tweetId: eachTweet.tweetId,
                username: username,
                tweet: eachTweet.tweet,
                dateTime: eachTweet.dateTime,
                likes: eachTweet.likes,
                replies: eachTweet.replies,
            }))
            this.setState({
                tweetsList: updatedData,
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
            <p>Failed to load profile</p>
            <button type="button" className="retry-button" onClick={this.getProfileData}>
                Retry
            </button>
        </div>
    )

    renderTweetsListView = () => {
        const { tweetsList } = this.state
        if (tweetsList.length === 0) {
            return (
                <div className="no-tweets-view">
                    <p>No Tweets Found</p>
                </div>
            )
        }
        return (
            <ul className="tweets-list">
                {tweetsList.map((eachTweet, index) => (
                    <TweetItem key={index} tweetDetails={eachTweet} />
                ))}
            </ul>
        )
    }

    renderProfileView = () => {
        const { apiStatus } = this.state
        const username = Cookies.get('user_name')

        switch (apiStatus) {
            case apiStatusConstants.success:
                return (
                    <div className="profile-content-container">
                        <div className="user-details-container">
                            <div className="user-profile-pic">
                                <p className="user-profile-pic-text">{username ? username[0].toUpperCase() : 'U'}</p>
                            </div>
                            <h1 className="user-name">{username}</h1>
                            <div className="user-stats-links">
                                <button className="stat-link-btn" onClick={() => this.props.history.push('/following')}>Following</button>
                                <button className="stat-link-btn" onClick={() => this.props.history.push('/followers')}>Followers</button>
                            </div>
                        </div>
                        <h1 className="tweets-heading">Tweets</h1>
                        {this.renderTweetsListView()}
                    </div>
                )
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
                <div className="profile-container-main">
                    {this.renderProfileView()}
                </div>
            </>
        )
    }
}

export default Profile
