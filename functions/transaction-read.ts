import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)
    const transaction = await client`
        SELECT *
        FROM transactions
            INNER JOIN holdings ON transactions.holding_id = holdings.id
            INNER JOIN assets ON holdings.asset_id = assets.id
        WHERE transactions.id = 1;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: transaction
        })
    }
}

export { handler }
