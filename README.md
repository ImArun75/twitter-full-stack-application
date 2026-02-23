# Twitter Clone Full Stack Application

A fully functional social media application built with React.js and Node.js that mirrors the core features of Twitter. This project demonstrates full-stack development skills including RESTful API design, authentication, state management, and responsive UI.


## 🛠 Tech Stack
- **Frontend**: React.js, CSS Modules, React Router, Cookies (js-cookie)
- **Backend**: Node.js, Express.js, SQLite, JSON Web Tokens (JWT), Bcrypt
- **Database**: SQLite (Local)

## ✨ Features
- **User Authentication**: Secure Login and Registration with JWT and Password Hashing (Bcrypt).
- **Tweet Management**: Create, Delete, and View Tweets.
- **Social Interactions**: 
  - **Like/Unlike** tweets.
  - **Reply** to tweets.
  - **Follow/Unfollow** users (View Following/Followers lists).
- **Feed System**: 
  - **Home Feed**: Displays tweets from users you follow.
  - **Profile Feed**: Displays only your tweets.
- **Responsive Design**: Mobile-friendly user interface.
- **Detailed Views**: Dedicated page for individual tweets showing threading (replies) and detailed stats.

## 📂 Project Structure
The repository is organized as a monorepo:
- **twitter-frontend/**: Contains the React application.
- **twitter_backend/**: Contains the Node.js/Express server and SQLite database.

## ⚙️ Local Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd twitter_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `twitter_backend/` with the following keys:
   ```env
   PORT=3000
   JWT_SECRET=MY_SECRET_KEY
   DB_PATH=twitterClone.db
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:3000`.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd twitter-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `twitter-frontend/` with the connection to your local backend:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:3000
   ```
4. Start the React app:
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3001` (or 3000 if backend is not running).

## 🌍 Deployment Guide (Render)

### Backend Deployment
1. Create a new **Web Service** on Render.
2. Connect this repository.
3. Settings:
   - **Root Directory**: `twitter_backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
   - **Environment Variables**: Add `JWT_SECRET`.
4. **Note on Database**: This project uses SQLite. On Render's free tier, the filesystem is ephemeral, meaning **data (new users, tweets) will be lost** when the server restarts. For production, consider switching to PostgreSQL.

### Frontend Deployment
1. Create a new **Static Site** on Render.
2. Connect this repository.
3. Settings:
   - **Root Directory**: `twitter-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
   - **Environment Variables**: Add `REACT_APP_API_BASE_URL` with the value of your **deployed Backend URL**.
