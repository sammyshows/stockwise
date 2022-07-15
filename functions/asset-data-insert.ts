import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const data = await fetch(`https://cloud.iexapis.com/stable/stock/${eventBody.symbol}/chart/5y?includeToday=true&chartCloseOnly=true&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    let historicalData = Object.values(data)

    // Get an array of all values for each required field. Then we can turn these into rows and use them in the update below
    const closes = historicalData.map(asset => asset.close)
    const labels = historicalData.map(asset => {
        const date = new Date(asset["date"])
        return date.toDateString().slice(4)
    })
    const dates = historicalData.map(asset => asset.date)

    await client`
    WITH asset_data (close, label, date) AS (
        SELECT * 
        FROM 
            UNNEST(
                ${closes}::NUMERIC[],
                ${labels}::TEXT[],
                ${dates}::DATE[]
            )
    )
    INSERT INTO partman.asset_data (asset_id, close, label, date)
    SELECT ${eventBody.assetId},
           close,
           label,
           date
    FROM asset_data`

    return {
        statusCode: 200
    }
})

export { handler }
