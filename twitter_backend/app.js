const express = require('express')
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
app.use(express.json())

// CORS for frontend on different port (including production domains)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  next()
})

const databasePath = path.join(__dirname, process.env.DB_PATH || 'twitterClone.db')
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'MY_SECRET_KEY'

const initializeDbAndStartServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(PORT, () => {
      console.log(`Server Running at http://localhost:${PORT}/`)
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndStartServer()

const convertUserDbObjectToResponseObject = dbObject => {
  return {
    userId: dbObject.user_id,
    name: dbObject.name,
    username: dbObject.username,
    password: dbObject.password,
    gender: dbObject.gender,
  }
}

const convertFollowerDbObjectToResponseObject = dbObject => {
  return {
    followerId: dbObject.follower_id,
    followerUserId: dbObject.follower_user_id,
    followingUserId: dbObject.following_user_id,
  }
}

const convertTweetDbObjectToResponseObject = dbObject => {
  return {
    tweetId: dbObject.tweet_id,
    tweet: dbObject.tweet,
    userId: dbObject.user_id,
    dateTime: dbObject.date_time,
  }
}

const convertReplyDbObjectToResponseObject = dbObject => {
  return {
    replyId: dbObject.reply_id,
    tweetId: dbObject.tweet_id,
    reply: dbObject.reply,
    userId: dbObject.user_id,
    dateTime: dbObject.date_time,
  }
}

const convertLikeDbObjectToResponseObject = dbObject => {
  return {
    likeId: dbObject.like_id,
    tweetId: dbObject.tweet_id,
    userId: dbObject.user_id,
    dateTime: dbObject.dateTime,
  }
}

app.post('/register/', async (request, response) => {
  const { username, password, name, gender } = request.body
  // check if user already exists with the same username
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  if (dbUser) {
    response.status(400)
    response.send('User already exists')
  } else if (password.length < 6) {
    response.status(400)
    response.send('Password is too short')
  } else {
    // Create a new user
    const hashedPassword = await bcrypt.hash(password, 10)
    const addNewUserQuery = `
        INSERT INTO user (name, username, password, gender) 
        VALUES ('${name}', '${username}', '${hashedPassword}', '${gender}');
        `
    await database.run(addNewUserQuery)
    response.send('User created successfully')
  }
})

app.post('/login/', async (request, response) => {
  const { username, password } = request.body
  // check if the username exists
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  if (!dbUser) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (!isPasswordMatched) {
      response.status(400)
      response.send('Invalid password')
    } else {
      const payload = { username }
      const jwtToken = jwt.sign(payload, JWT_SECRET)
      response.send({ jwtToken })
    }
  }
})

// Authentication Middleware
const authenticateUser = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (!authHeader) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwtToken = authHeader.split(' ')[1]
    jwt.verify(jwtToken, JWT_SECRET, (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.username = payload.username
        next()
      }
    })
  }
}

app.get('/user/tweets/feed/', authenticateUser, async (request, response) => {
  const { username } = request
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  const followingUsersQuery = `
    SELECT following_user_id FROM follower 
    WHERE follower_user_id = ${dbUser.user_id};
  `
  const followingUsersObjectsList = await database.all(followingUsersQuery)
  let followingUsersList = followingUsersObjectsList.map(object => {
    return object['following_user_id']
  })
  // Include own tweets in feed so user sees their posts
  if (!followingUsersList.includes(dbUser.user_id)) {
    followingUsersList = [dbUser.user_id, ...followingUsersList]
  }
  if (followingUsersList.length === 0) {
    response.send([])
    return
  }

  const getTweetsQuery = `
  SELECT 
    user.username AS username, 
    tweet.tweet_id AS tweetId,
    tweet.tweet AS tweet, 
    tweet.date_time AS dateTime
  FROM 
    tweet 
    INNER JOIN user ON tweet.user_id = user.user_id 
  WHERE
    tweet.user_id IN (
        ${followingUsersList}
    )
  ORDER BY tweet.date_time DESC 
  LIMIT 4;
  `
  const tweets = await database.all(getTweetsQuery)
  response.send(tweets)
})

app.get('/user/following/', authenticateUser, async (request, response) => {
  const { username } = request
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  const followingUsersQuery = `
    SELECT following_user_id FROM follower 
    WHERE follower_user_id = ${dbUser.user_id};
  `
  const followingUsersObjectsList = await database.all(followingUsersQuery)
  const followingUsersList = followingUsersObjectsList.map(object => {
    return object['following_user_id']
  })
  if (followingUsersList.length === 0) {
    response.send([])
    return
  }
  const getFollowingQuery = `
  SELECT 
    user.name AS name
  FROM 
    user
  WHERE
    user_id IN (
        ${followingUsersList}
    );
  `
  const following = await database.all(getFollowingQuery)
  response.send(following)
})

app.get('/user/followers/', authenticateUser, async (request, response) => {
  const { username } = request
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  const followerUsersQuery = `
    SELECT follower_user_id FROM follower 
    WHERE following_user_id = ${dbUser.user_id};
  `
  const followerUsersObjectsList = await database.all(followerUsersQuery)
  const followerUsersList = followerUsersObjectsList.map(object => {
    return object['follower_user_id']
  })
  if (followerUsersList.length === 0) {
    response.send([])
    return
  }
  const getFollowersQuery = `
  SELECT 
    user.name AS name
  FROM 
    user
  WHERE
    user_id IN (
        ${followerUsersList}
    );
  `
  const followers = await database.all(getFollowersQuery)
  response.send(followers)
})

app.get('/tweets/:tweetId/', authenticateUser, async (request, response) => {
  const { tweetId } = request.params
  const { username } = request
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  const getTweetQuery = `
  SELECT * FROM tweet WHERE tweet_id = ${tweetId};
  `
  const tweetInfo = await database.get(getTweetQuery)
  if (!tweetInfo) {
    response.status(404)
    response.send('Tweet not found')
    return
  }

  const followingUsersQuery = `
    SELECT following_user_id FROM follower 
    WHERE follower_user_id = ${dbUser.user_id};
  `
  const followingUsersObjectsList = await database.all(followingUsersQuery)
  const followingUsersList = followingUsersObjectsList.map(object => {
    return object['following_user_id']
  })
  if (!followingUsersList.includes(tweetInfo.user_id)) {
    response.status(401)
    response.send('Invalid Request')
  } else {
    const { tweet_id, date_time, tweet } = tweetInfo
    const getLikesQuery = `
    SELECT COUNT(like_id) AS likes FROM like 
    WHERE tweet_id = ${tweet_id} GROUP BY tweet_id;
    `
    const likesObject = await database.get(getLikesQuery)
    const getRepliesQuery = `
    SELECT COUNT(reply_id) AS replies FROM reply 
    WHERE tweet_id = ${tweet_id} GROUP BY tweet_id;
    `
    const repliesObject = await database.get(getRepliesQuery)

    const tweetConfig = await database.get(`SELECT username FROM user WHERE user_id=${tweetInfo.user_id}`)

    response.send({
      tweet,
      likes: likesObject.likes,
      replies: repliesObject.replies,
      dateTime: date_time,
      userId: tweetInfo.user_id,
      username: tweetConfig.username,
    })
  }
})

app.get(
  '/tweets/:tweetId/likes/',
  authenticateUser,
  async (request, response) => {
    const { tweetId } = request.params
    const { username } = request
    const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
    const dbUser = await database.get(selectUserQuery)
    const getTweetQuery = `
  SELECT * FROM tweet WHERE tweet_id = ${tweetId};
  `
    const tweetInfo = await database.get(getTweetQuery)
    if (!tweetInfo) {
      response.status(404)
      response.send('Tweet not found')
      return
    }

    const followingUsersQuery = `
    SELECT following_user_id FROM follower 
    WHERE follower_user_id = ${dbUser.user_id};
  `
    const followingUsersObjectsList = await database.all(followingUsersQuery)
    const followingUsersList = followingUsersObjectsList.map(object => {
      return object['following_user_id']
    })
    if (!followingUsersList.includes(tweetInfo.user_id)) {
      response.status(401)
      response.send('Invalid Request')
    } else {
      const { tweet_id } = tweetInfo
      const getLikesQuery = `
        SELECT user_id FROM like 
        WHERE tweet_id = ${tweet_id};
        `
      const likedUserIdObjectsList = await database.all(getLikesQuery)
      const likedUserIdsList = likedUserIdObjectsList.map(object => {
        return object.user_id
      })
      if (likedUserIdsList.length === 0) {
        response.send({ likes: [] })
        return
      }
      const getLikedUsersQuery = `
      SELECT username FROM user 
      WHERE user_id IN (${likedUserIdsList});
      `
      const likedUsersObjectsList = await database.all(getLikedUsersQuery)
      const likedUsersList = likedUsersObjectsList.map(object => {
        return object.username
      })
      response.send({
        likes: likedUsersList,
      })
    }
  },
)

app.get(
  '/tweets/:tweetId/replies/',
  authenticateUser,
  async (request, response) => {
    const { tweetId } = request.params
    const { username } = request
    const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
    const dbUser = await database.get(selectUserQuery)
    const getTweetQuery = `
  SELECT * FROM tweet WHERE tweet_id = ${tweetId};
  `
    const tweetInfo = await database.get(getTweetQuery)
    if (!tweetInfo) {
      response.status(404)
      response.send('Tweet not found')
      return
    }

    const followingUsersQuery = `
    SELECT following_user_id FROM follower 
    WHERE follower_user_id = ${dbUser.user_id};
  `
    const followingUsersObjectsList = await database.all(followingUsersQuery)
    const followingUsersList = followingUsersObjectsList.map(object => {
      return object['following_user_id']
    })
    if (!followingUsersList.includes(tweetInfo.user_id)) {
      response.status(401)
      response.send('Invalid Request')
    } else {
      const { tweet_id, date_time } = tweetInfo
      const getUserRepliesQuery = `
    SELECT user.name AS name, reply.reply AS reply
    FROM reply 
    INNER JOIN user ON reply.user_id = user.user_id 
    WHERE reply.tweet_id = ${tweet_id};
    `
      const userRepliesObject = await database.all(getUserRepliesQuery)
      response.send({
        replies: userRepliesObject,
      })
    }
  },
)

app.get('/user/tweets/', authenticateUser, async (request, response) => {
  const { username } = request
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  const { user_id } = dbUser
  //   const user_id = 4;
  const getTweetsQuery = `
  SELECT * FROM tweet WHERE user_id = ${user_id}
  ORDER BY tweet_id;
  `
  const tweetObjectsList = await database.all(getTweetsQuery)
  if (tweetObjectsList.length === 0) {
    response.send([])
    return
  }

  const tweetIdsList = tweetObjectsList.map(object => {
    return object.tweet_id
  })

  const getLikesQuery = `
    SELECT COUNT(like_id) AS likes FROM like 
    WHERE tweet_id IN (${tweetIdsList}) GROUP BY tweet_id
    ORDER BY tweet_id;
    `
  const likesObjectsList = await database.all(getLikesQuery)
  const getRepliesQuery = `
    SELECT COUNT(reply_id) AS replies FROM reply 
    WHERE tweet_id IN (${tweetIdsList}) GROUP BY tweet_id
    ORDER BY tweet_id;
    `
  const repliesObjectsList = await database.all(getRepliesQuery)
  response.send(
    tweetObjectsList.map((tweetObj, index) => {
      const likes = likesObjectsList[index] ? likesObjectsList[index].likes : 0
      const replies = repliesObjectsList[index]
        ? repliesObjectsList[index].replies
        : 0
      return {
        tweetId: tweetObj.tweet_id,
        tweet: tweetObj.tweet,
        likes,
        replies,
        dateTime: tweetObj.date_time,
      }
    }),
  )
})

app.post('/user/tweets/', authenticateUser, async (request, response) => {
  const { username } = request
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  const { user_id } = dbUser
  const { tweet } = request.body
  const dateString = new Date().toISOString()
  const dateTime = dateString.slice(0, 10) + ' ' + dateString.slice(11, 19)
  const addNewTweetQuery = `
  INSERT INTO tweet (tweet, user_id, date_time) 
  VALUES ('${tweet}', ${user_id}, '${dateTime}');
  `
  await database.run(addNewTweetQuery)
  response.send('Created a Tweet')
})

app.post('/tweets/:tweetId/like/', authenticateUser, async (request, response) => {
  const { tweetId } = request.params
  const { username } = request
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  const { user_id } = dbUser

  const getLikeQuery = `
    SELECT * FROM like WHERE user_id = ${user_id} AND tweet_id = ${tweetId};
  `
  const likedObject = await database.get(getLikeQuery)

  if (likedObject === undefined) {
    const addLikeQuery = `
      INSERT INTO like (user_id, tweet_id) 
      VALUES (${user_id}, ${tweetId});
    `
    await database.run(addLikeQuery)
    response.send('Tweet Liked')
  } else {
    const removeLikeQuery = `
      DELETE FROM like WHERE user_id = ${user_id} AND tweet_id = ${tweetId};
    `
    await database.run(removeLikeQuery)
    response.send('Tweet Disliked')
  }
})

app.post('/tweets/:tweetId/reply/', authenticateUser, async (request, response) => {
  const { tweetId } = request.params
  const { reply } = request.body
  const { username } = request
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  const { user_id } = dbUser

  const addReplyQuery = `
    INSERT INTO reply (tweet_id, reply, user_id) 
    VALUES (${tweetId}, '${reply}', ${user_id});
  `
  await database.run(addReplyQuery)
  response.send('Reply Posted')
})

app.delete('/tweets/:tweetId/', authenticateUser, async (request, response) => {
  const { tweetId } = request.params
  const { username } = request
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';
    `
  const dbUser = await database.get(selectUserQuery)
  const getTweetQuery = `
  SELECT * FROM tweet WHERE tweet_id = ${tweetId};
  `
  const tweetInfo = await database.get(getTweetQuery)
  if (!tweetInfo) {
    response.status(404)
    response.send('Tweet not found')
    return
  }
  if (dbUser.user_id !== tweetInfo.user_id) {
    response.status(401)
    response.send('Invalid Request')
  } else {
    const deleteTweetQuery = `
      DELETE FROM tweet WHERE tweet_id = ${tweetId};
      `
    await database.run(deleteTweetQuery)
    response.send('Tweet Removed')
  }
})

module.exports = app
