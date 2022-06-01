import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)
    let studyId
    console.log(eventBody)

    if (eventBody.manualEntry) {
        // If it's a manual entry
        console.log('here')
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
            const asset = await fetch(`${process.env.DOMAIN}/api/asset-upsert`, {
                method: 'POST',
                body: JSON.stringify({
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
}

export { handler }
