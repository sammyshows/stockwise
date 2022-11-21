import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const historicalData = await client`
        SELECT close, label, date 
        FROM partman.asset_data
        WHERE asset_id = ${eventBody.assetId}
        ORDER BY date ASC`

    const dayData = await fetch(`https://cloud.iexapis.com/stable/stock/${eventBody.symbol}/intraday-prices?token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200,
        body: JSON.stringify({
            max: historicalData,
            day: dayData
        })
    }
})

export { handler }
