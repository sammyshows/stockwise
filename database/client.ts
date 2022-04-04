import postgres from "postgres";

const PgClient = (() => {
    if (process.env.DEVELOPMENT) {
        // If in a 'development' environment allow access WITHOUT a ssl certificate
        return postgres(process.env.DATABASE_URL,{
            ssl: { rejectUnauthorized: false }
        })
    } else {
        // If in a 'production' environment allow access ONLY WITH a ssl certificate
        return postgres(process.env.DATABASE_URL, {
            ssl: { rejectUnauthorized: false }
        })
    }
})()

export default PgClient