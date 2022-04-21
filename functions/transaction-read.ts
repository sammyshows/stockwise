import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)
    const transaction = await client`
        SELECT type, quantity, initial_price, exchange_rate, symbol, exchange, name
        FROM transactions
            INNER JOIN holdings ON transactions.holding_id = holdings.id
            INNER JOIN assets ON holdings.asset_id = assets.id
        WHERE transactions.id = ${eventBody.transactionId};`

    return {
        statusCode: 200,
        body: JSON.stringify({
            transaction: transaction
        })
    }
}

export { handler }
