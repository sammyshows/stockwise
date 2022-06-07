import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
import fetch from "node-fetch";
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)
    let studyId

    if (eventBody.manualEntry) {
        // If it's a manual entry
        studyId = await client`
            INSERT INTO studies (user_id, name, symbol, type)
            VALUES (${eventBody.uuid}, ${eventBody.name}, ${eventBody.symbol}, ${eventBody.type})
            RETURNING id;`
    } else {
        // If the asset is available via IEX and exists in the database
        try {
            studyId = await client`
                INSERT INTO studies (user_id, asset_id, name, symbol, type) 
                SELECT ${eventBody.uuid}, id, name, symbol, ${eventBody.type}
                FROM assets
                WHERE assets.symbol = ${eventBody.symbol}
                RETURNING id;`
            if (!studyId[0])
                throw 'Asset not found'
        } catch (err) {
            // If error, it's likely the asset is available via IEX but doesn't yet exist in the database
            const asset = await fetch(`${process.env.DOMAIN}/api/asset-upsert-stock`, {
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
            console.log(asset['data'])
            studyId = await client`
            INSERT INTO studies (user_id, asset_id, name, symbol, type)
            VALUES (${eventBody.uuid}, ${asset['data'].id}, ${asset['data'].name}, ${asset['data'].symbol}, ${eventBody.type})
            RETURNING id;`
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            studyId: studyId[0].id
        })
    }
})

export { handler }
