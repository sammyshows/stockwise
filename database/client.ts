const { Client } = require('pg-native');

const PgClient = (() => {
    if (process.env.NODE_ENV === 'development') {
        // If in a 'development' environment allow access WITHOUT a ssl certificate
        return new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: false
        })
    } else {
        // If in a 'production' environment allow access ONLY WITH a ssl certificate
        return new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })
    }
})()

module.exports = PgClient