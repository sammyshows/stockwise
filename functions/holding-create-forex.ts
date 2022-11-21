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

    try {
        holdingId = await client`
        INSERT INTO holdings (portfolio_id, asset_id) 
        SELECT ${eventBody.portfolio}, id
        FROM assets
        WHERE assets.symbol = ${eventBody.from + eventBody.to}
        RETURNING id;`
        if (!holdingId[0])
            throw 'Asset not found'
    } catch (err) {
        // This logic is reusable for both forex and stocks, so just do a simple check to see which function to call:
        const asset = await fetch(process.env.DOMAIN + '/api/asset-upsert-forex', {
            headers: {
                authorization: eventBody.token
            },
            method: 'POST',
            body: JSON.stringify({
                token: eventBody.token,
                from: eventBody.from,
                to: eventBody.to
            })
        })
            .then(response => response.json())

        holdingId = await client`
            INSERT INTO holdings (portfolio_id, asset_id) 
            VALUES (${eventBody.portfolio}, ${asset['data'].id})
            RETURNING id;`
    }

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200,
        body: JSON.stringify({
            holdingId: holdingId[0].id
        })
    }
})

export { handler }
