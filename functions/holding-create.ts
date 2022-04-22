import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holdingId = await client`
        INSERT INTO holdings (portfolio_id, asset_id) 
        VALUES (${eventBody.portfolio}, ${eventBody.asset})
        RETURNING id;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            holding: holdingId
        })
    }
}

export { handler }
