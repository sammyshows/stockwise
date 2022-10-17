import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        UPDATE assets
        SET current_price = ${eventBody.currentPrice}
        WHERE id = ${eventBody.assetId};`


    return {
        statusCode: 200
    }
})

export { handler }
