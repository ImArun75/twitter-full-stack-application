
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

const TweetItem = props => {
    const { tweetDetails } = props
    const { tweetId, username, tweet, dateTime, likes, replies } = tweetDetails
    const initial = username ? username[0].toUpperCase() : '?'

    const linkPath = tweetId ? `/tweets/${tweetId}` : '#'
    const loggedInUser = Cookies.get('user_name')
    const isOwner = loggedInUser === username

    const onDelete = async (event) => {
        event.preventDefault() // Prevent navigation
        const jwtToken = Cookies.get('jwt_token')
        const url = `${process.env.REACT_APP_API_BASE_URL}/tweets/${tweetId}/`
        const options = {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        }
        const response = await fetch(url, options)
        if (response.ok) {
            // Callback to parent to refresh list? 
            // For now, simpler to just reload or if we had a callback prop.
            // Let's assume we pass a refresh callback or just reload window.
            window.location.reload()
        } else {
            alert('Failed to delete tweet')
        }
    }

    const onLike = async (event) => {
        event.preventDefault()
        const jwtToken = Cookies.get('jwt_token')
        const url = `${process.env.REACT_APP_API_BASE_URL}/tweets/${tweetId}/like/`
        const options = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        }
        const response = await fetch(url, options)
        if (response.ok) {
            window.location.reload()
        } else {
            alert('Failed to like tweet')
        }
    }

    return (
        <li className="tweet-item">
            <Link to={linkPath} className="tweet-item-link">
                <div className="profile-container">
                    <div className="profile-pic-container">
                        <p className="profile-pic-text">{initial}</p>
                    </div>
                </div>
                <div className="tweet-content">
                    <div className="tweet-header-row">
                        <p className="tweet-author">{username || 'Unknown'}</p>
                        {isOwner && (
                            <button className="delete-btn" onClick={onDelete}>
                                Delete
                            </button>
                        )}
                    </div>
                    <p className="tweet-text">{tweet}</p>
                    <p className="tweet-time">{dateTime}</p>
                    <div className="tweet-stats-preview">
                        {likes !== undefined && (
                            <button className="stat-preview-btn" onClick={onLike}>
                                Likes: {likes}
                            </button>
                        )}
                        {replies !== undefined && <span className="stat-preview">Replies: {replies}</span>}
                    </div>
                </div>
            </Link>
        </li>
    )
}

export default TweetItem
