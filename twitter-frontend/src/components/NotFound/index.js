import { Link } from 'react-router-dom'
import './index.css'

const NotFound = () => (
  <div className="not-found-container">
    <h1 className="not-found-heading">Page Not Found</h1>
    <p className="not-found-text">The page you're looking for doesn't exist.</p>
    <Link to="/">Go to Home</Link>
  </div>
)

export default NotFound
