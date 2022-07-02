import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const historicalData = await fetch(`https://cloud.iexapis.com/stable/stock/${eventBody.symbol}/chart/1y?includeToday=true&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    const dayData = await fetch(`https://cloud.iexapis.com/stable/stock/${eventBody.symbol}/intraday-prices?token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    return {
        statusCode: 200,
        body: JSON.stringify({
            max: historicalData,
            day: dayData
        })
    }
})

export { handler }
