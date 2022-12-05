import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const userSettings = await client`
        SELECT u.id,
               email,
               SUBSTRING(a.symbol, 4, 6) AS currency
        FROM user_settings AS u
        INNER JOIN users ON users.id = u.user_id
        INNER JOIN assets AS a ON u.currency_id = a.id   
        WHERE u.user_id = ${eventBody.userId};`

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200,
        body: JSON.stringify({
            data: userSettings[0]
        })
    }
})

export { handler }
