import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
import fetch from "node-fetch";
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holdingId = await client`
        INSERT INTO holdings (portfolio_id, asset_id) 
        SELECT ${eventBody.portfolio}, id
        FROM assets
        WHERE assets.symbol = ${eventBody.symbol} AND assets.type = 2
        RETURNING id;`

    if (!holdingId[0])
        throw 'Asset not found'

    return {
        statusCode: 200,
        body: JSON.stringify({
            holdingId: holdingId[0].id
        })
    }
})

export { handler }
