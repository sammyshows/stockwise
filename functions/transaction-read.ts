import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const transaction = await client`
        SELECT a.type AS asset_type,
               t.type AS type,
               COALESCE(t.sell_method, null) AS sell_method,
               t.quantity,
               t.initial_price,
               t.exchange_rate,
               a.symbol,
               a.exchange,
               a.name, 
               t.timestamp
        FROM transactions AS t
            INNER JOIN holdings AS h ON t.holding_id = h.id
            INNER JOIN assets AS a ON h.asset_id = a.id
        WHERE t.id = ${eventBody.transactionId};`
    console.log(transaction)
    return {
        statusCode: 200,
        body: JSON.stringify({
            data: transaction
        })
    }
})

export { handler }
