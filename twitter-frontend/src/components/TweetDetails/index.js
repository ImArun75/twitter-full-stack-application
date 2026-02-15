
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

class TweetDetails extends Component {
    state = {
        tweetData: {},
        likesData: [],
        repliesData: [],
        apiStatus: apiStatusConstants.initial,
        replyInput: '',
    }

    componentDidMount() {
        this.getTweetDetails()
    }

    getTweetDetails = async () => {
        this.setState({ apiStatus: apiStatusConstants.inProgress })
        const { match } = this.props
        const { params } = match
        const { id } = params
        const jwtToken = Cookies.get('jwt_token')

        const tweetUrl = `${process.env.REACT_APP_API_BASE_URL}/tweets/${id}/`
        const likesUrl = `${process.env.REACT_APP_API_BASE_URL}/tweets/${id}/likes/`
        const repliesUrl = `${process.env.REACT_APP_API_BASE_URL}/tweets/${id}/replies/`

        const options = {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
            method: 'GET',
        }

        try {
            const [tweetResponse, likesResponse, repliesResponse] = await Promise.all([
                fetch(tweetUrl, options),
                fetch(likesUrl, options),
                fetch(repliesUrl, options)
            ])

            if (tweetResponse.ok && likesResponse.ok && repliesResponse.ok) {
                const tweetData = await tweetResponse.json()
                const likesData = await likesResponse.json()
                const repliesData = await repliesResponse.json()

                this.setState({
                    tweetData,
                    likesData: likesData.likes,
                    repliesData: repliesData.replies,
                    apiStatus: apiStatusConstants.success,
                })
            } else {
                this.setState({ apiStatus: apiStatusConstants.failure })
            }
        } catch (error) {
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
            <p>Failed to load tweet details</p>
            <button type="button" className="retry-button" onClick={this.getTweetDetails}>
                Retry
            </button>
        </div>
    )

    renderTweetDetailsView = () => {
        const { tweetData, likesData, repliesData } = this.state
        const { tweet, dateTime, likes, replies, username } = tweetData
        const loggedInUser = Cookies.get('user_name')
        const isOwner = loggedInUser === username
        const jwtToken = Cookies.get('jwt_token')
        const { match } = this.props
        const { id } = match.params

        const onDelete = async () => {
            const url = `${process.env.REACT_APP_API_BASE_URL}/tweets/${id}/`
            const options = {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            }
            const response = await fetch(url, options)
            if (response.ok) {
                this.props.history.replace('/')
            } else {
                alert('Failed to delete tweet')
            }
        }

        return (
            <div className="tweet-details-content">
                <div className="tweet-header-row-details">
                    <div className="profile-container">
                        <div className="profile-pic-container">
                            <p className="profile-pic-text">{username ? username[0].toUpperCase() : '?'}</p>
                        </div>
                    </div>
                    <div className="tweet-author-details">
                        <p className="tweet-author-name">{username}</p>
                    </div>
                    {isOwner && (
                        <button className="delete-btn-details" onClick={onDelete}>
                            Delete
                        </button>
                    )}
                </div>

                <h1 className="tweet-full-text">{tweet}</h1>
                <p className="tweet-full-time">{dateTime}</p>

                <div className="tweet-stats">
                    <div className="stat-item">
                        <p className="stat-count">{likes}</p>
                        <p className="stat-label">Likes</p>
                    </div>
                    <div className="stat-item">
                        <p className="stat-count">{replies}</p>
                        <p className="stat-label">Replies</p>
                    </div>
                </div>

                <hr className="separator" />

                <div className="reply-input-section">
                    <textarea
                        className="reply-textarea"
                        placeholder="Tweet your reply"
                        value={this.state.replyInput}
                        onChange={e => this.setState({ replyInput: e.target.value })}
                    />
                    <button className="reply-button" onClick={this.onSubmitReply}>Reply</button>
                </div>

                <hr className="separator" />

                <div className="liked-by-section">
                    <h2 className="section-title">Liked By</h2>
                    {likesData.length > 0 ? (
                        <div className="liked-users-list">
                            {likesData.map((user, index) => (
                                <p key={index} className="liked-user-name">{user}</p>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data-text">No likes yet</p>
                    )}
                </div>

                <hr className="separator" />

                <div className="replies-section">
                    <h2 className="section-title">Replies</h2>
                    {repliesData.length > 0 ? (
                        <ul className="replies-list">
                            {repliesData.map((reply, index) => (
                                <li key={index} className="reply-item">
                                    <p className="reply-user">{reply.name}</p>
                                    <p className="reply-text">{reply.reply}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-data-text">No replies yet</p>
                    )}
                </div>
            </div>
        )
    }

    onSubmitReply = async () => {
        const { replyInput } = this.state
        const { match } = this.props
        const { id } = match.params
        const jwtToken = Cookies.get('jwt_token')

        if (!replyInput || replyInput.trim() === '') return

        const url = `${process.env.REACT_APP_API_BASE_URL}/tweets/${id}/reply/`
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ reply: replyInput }),
        }
        const response = await fetch(url, options)
        if (response.ok) {
            this.setState({ replyInput: '' })
            this.getTweetDetails()
        } else {
            alert('Failed to delete tweet')
        }
    }

    render() {
        const { apiStatus } = this.state

        let content
        switch (apiStatus) {
            case apiStatusConstants.success:
                content = this.renderTweetDetailsView()
                break
            case apiStatusConstants.failure:
                content = this.renderFailureView()
                break
            case apiStatusConstants.inProgress:
                content = this.renderLoadingView()
                break
            default:
                content = null
        }

        return (
            <>
                <Header />
                <div className="tweet-details-container">
                    {content}
                </div>
            </>
        )
    }
}

export default TweetDetails
