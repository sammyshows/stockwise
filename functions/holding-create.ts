import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
import fetch from "node-fetch";
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)
    let holdingId

    // FUN FACT: When creating the holding below, we try to make the process snappy by using the stored asset if it exists.
    // If not then we call asset-upsert to create it first, but 99% of the time the asset will exist (someone out in the
    // world would most likely already have the holding) so it's pointless wasting time upserting everytime.

    // FUN FACT: As you can see below we don't need to pass any params to create a holding besides the portfolio_id & asset_id.
    // This is because of a stored function that updates the share_count, initial_value and transaction_count automatically
    // on insert or update.

    try {
        holdingId = await client`
        INSERT INTO holdings (portfolio_id, asset_id) 
        SELECT ${eventBody.portfolio}, id
        FROM assets
        WHERE assets.symbol = ${eventBody.symbol}
        RETURNING id;`
        if (!holdingId[0])
            throw 'Asset not found'
    } catch (err) {
        const asset = await fetch(`${process.env.DOMAIN}/api/asset-upsert`, {
            headers: {
                authorization: 'Bearer ' + eventBody.token
            },
            method: 'POST',
            body: JSON.stringify({
                token: eventBody.token,
                symbol: eventBody.symbol
            })
        })
            .then(response => response.json())

        holdingId = await client`
            INSERT INTO holdings (portfolio_id, asset_id) 
            VALUES (${eventBody.portfolio}, ${asset['data'].id})
            RETURNING id;`
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            holdingId: holdingId[0].id
        })
    }
})

export { handler }
