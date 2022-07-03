import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const chartData = await client`
        SELECT current_value, initial_value, all_time_change, all_time_percent, date 
        FROM partman.portfolio_data 
        WHERE portfolio_id = ${eventBody.portfolioId} AND date < ${eventBody.date}
        ORDER BY created_at ASC;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            chartData: chartData
        })
    }
})

export { handler }
