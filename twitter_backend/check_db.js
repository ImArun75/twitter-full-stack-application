
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'twitterClone.db')

const checkDb = async () => {
    try {
        const database = await open({
            filename: databasePath,
            driver: sqlite3.Database,
        })

        console.log('--- Table: reply ---')
        const replyColumns = await database.all("PRAGMA table_info(reply);")
        console.log(replyColumns.map(c => c.name))

        console.log('--- Table: like ---')
        const likeColumns = await database.all("PRAGMA table_info(like);")
        console.log(likeColumns.map(c => c.name))

        console.log('--- Table: tweet ---')
        const tweetColumns = await database.all("PRAGMA table_info(tweet);")
        console.log(tweetColumns.map(c => c.name))

    } catch (error) {
        console.log(`DB Error: ${error.message}`)
    }
}

checkDb()
