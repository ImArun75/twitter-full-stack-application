import { Switch, Route, Redirect } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import Profile from './components/Profile'
import Following from './components/Following'
import Followers from './components/Followers'
import TweetDetails from './components/TweetDetails'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

const App = () => (
  <Switch>
    <Route exact path="/login" component={Login} />
    <Route exact path="/register" component={Register} />
    <ProtectedRoute exact path="/" component={Home} />
    <ProtectedRoute exact path="/profile" component={Profile} />
    <ProtectedRoute exact path="/following" component={Following} />
    <ProtectedRoute exact path="/followers" component={Followers} />
    <ProtectedRoute exact path="/tweets/:id" component={TweetDetails} />
    <Route path="/not-found" component={NotFound} />
    <Redirect to="/not-found" />
  </Switch>
)

export default App
