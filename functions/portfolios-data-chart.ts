import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const chartData = await client`
        SELECT current_value, initial_value, date 
        FROM partman.user_portfolios_data 
        WHERE user_id = ${eventBody.userId} AND date < ${eventBody.date}
        ORDER BY created_at ASC;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            chartData: chartData
        })
    }
})

export { handler }
