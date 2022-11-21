import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        UPDATE assets
        SET current_price = ${eventBody.currentPrice},
            currency_id = (SELECT id FROM assets WHERE symbol = ${eventBody.currency + 'USD'} AND type = 1)
        WHERE id = ${eventBody.assetId};`


    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
})

export { handler }
