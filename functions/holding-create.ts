import { Handler } from "@netlify/functions";
import transaction from "~/pages/portfolios/[portfolio]/holdings/[holding]/transactions/[transaction].vue";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holdingId = await client`
        INSERT INTO holdings (portfolio_id, asset_id, share_count, initial_value, transaction_count) 
        VALUES (${eventBody.portfolio}, ${eventBody.asset}, ${eventBody.quantity}, ${eventBody.initialValue}, 1)
        RETURNING id;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            holding: holdingId
        })
    }
}

export { handler }
