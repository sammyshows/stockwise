import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const asset = await fetch(`${process.env.DOMAIN}/api/stock-quote`, {
        headers: {
            authorization: 'Bearer ' + eventBody.token
        },
        method: 'POST',
        body: JSON.stringify({
            symbol: eventBody.symbol
        })
    })
        .then(response => response.json())
        .then(asset => asset["data"])

    const createdAsset = await client`
        INSERT INTO assets (symbol, current_price, prev_close, name, exchange, currency_id, type)
        SELECT ${asset.symbol}, 
               ${asset.latestPrice}, 
               ${asset.previousClose}, 
               ${asset.companyName}, 
               ${asset.primaryExchange},
               id,
               0
        FROM assets WHERE symbol = ${asset.currency} AND type = 2
        ON CONFLICT (symbol)
        WHERE NOT (type = 3)
            DO UPDATE SET current_price = ${asset.latestPrice},
                          name = ${asset.companyName || eventBody.name },
                          exchange = ${asset.primaryExchange || eventBody.exchange}
        RETURNING id, name, symbol;`


    // Add historical data for this stock chart
    await fetch(`${process.env.DOMAIN}/api/asset-data-insert`, {
        headers: {
            authorization: 'Bearer ' + eventBody.token
        },
        method: 'POST',
        body: JSON.stringify({
            assetId: createdAsset[0].id,
            symbol: asset.symbol
        })
    })


    return {
        statusCode: 200,
        body: JSON.stringify({
            data: createdAsset[0]
        })
    }
})

export { handler }
