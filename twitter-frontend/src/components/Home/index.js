
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

class Home extends Component {
    state = {
        tweetsList: [],
        apiStatus: apiStatusConstants.initial,
        tweetInput: '',
        addTweetLoading: false,
        addTweetError: '',
    }

    componentDidMount() {
        this.getTweets()
    }

    onChangeTweetInput = event => {
        this.setState({ tweetInput: event.target.value })
    }

    onAddTweet = async () => {
        const tweetText = this.state.tweetInput.trim()
        if (!tweetText) {
            this.setState({ addTweetError: 'Tweet cannot be empty' })
            return
        }
        this.setState({ addTweetError: '', addTweetLoading: true })
        const jwtToken = Cookies.get('jwt_token')
        const url = `${process.env.REACT_APP_API_BASE_URL}/user/tweets/`
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({ tweet: tweetText }),
        }
        const response = await fetch(url, options)
        this.setState({ addTweetLoading: false })
        if (response.status === 401) {
            Cookies.remove('jwt_token')
            this.props.history.replace('/login')
            return
        }
        if (response.ok) {
            this.setState({ tweetInput: '' })
            this.getTweets()
        } else {
            this.setState({ addTweetError: 'Failed to post tweet' })
        }
    }

    getTweets = async () => {
        this.setState({ apiStatus: apiStatusConstants.inProgress })
        const jwtToken = Cookies.get('jwt_token')
        const url = `${process.env.REACT_APP_API_BASE_URL}/user/tweets/feed/`
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
            const updatedData = (data || []).map(eachTweet => ({
                tweetId: eachTweet.tweetId,
                username: eachTweet.username,
                tweet: eachTweet.tweet,
                dateTime: eachTweet.dateTime,
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
            <p>Failed to load tweets</p>
            <button type="button" className="retry-button" onClick={this.getTweets}>
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

    renderAllTweets = () => {
        const { apiStatus } = this.state

        switch (apiStatus) {
            case apiStatusConstants.success:
                return this.renderTweetsListView()
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
                <div className="home-container">
                    <div className="home-content">
                        <h1 className="home-heading">Home</h1>
                        <div className="tweet-input-container">
                            <textarea
                                className="tweet-input"
                                placeholder="What's happening?"
                                value={this.state.tweetInput}
                                onChange={this.onChangeTweetInput}
                                disabled={this.state.addTweetLoading}
                            />
                            {this.state.addTweetError && (
                                <p className="add-tweet-error">{this.state.addTweetError}</p>
                            )}
                            <button
                                type="button"
                                className="tweet-button"
                                onClick={this.onAddTweet}
                                disabled={this.state.addTweetLoading}
                            >
                                {this.state.addTweetLoading ? 'Posting...' : 'Tweet'}
                            </button>
                        </div>
                        {this.renderAllTweets()}
                    </div>
                </div>
            </>
        )
    }
}

export default Home
