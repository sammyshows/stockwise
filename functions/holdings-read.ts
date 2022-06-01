import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holdings = await client`
        SELECT holdings.id,
               portfolios.name AS portfolio,
               assets.symbol,
               assets.exchange,
               assets.name,
               transaction_count, 
               initial_value as initial_value,
               current_price*share_count AS current_value, 
               (current_price - prev_close) * share_count AS daily_change,
               (current_price - prev_close)*100 / prev_close AS daily_percent,
               current_price*share_count - initial_value AS total_change
        FROM holdings 
            INNER JOIN assets ON holdings.asset_id = assets.id 
            INNER JOIN portfolios ON holdings.portfolio_id = portfolios.id 
        WHERE portfolios.id = ${eventBody.portfolioId}
        ORDER BY holdings.created_at;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: holdings
        })
    }
})

export { handler }
