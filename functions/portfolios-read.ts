import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const portfolios = await client`
        SELECT portfolios.id,
               portfolios.name,
               COUNT(holdings.id) as holding_count,
               SUM(initial_value) as initial_value,
               SUM(current_price*share_count) as current_value,
               SUM((current_price - prev_close) * share_count) as daily_change,
               SUM(current_price*share_count - initial_value) as total_change
        FROM portfolios
             LEFT JOIN holdings ON portfolios.id = holdings.portfolio_id
             LEFT JOIN assets ON holdings.asset_id = assets.id
        WHERE portfolios.user_id = ${eventBody.uuid}
        GROUP BY portfolios.id
        ORDER BY portfolios.created_at;
    `

    return {
        statusCode: 200,
        body: JSON.stringify({
            portfolios: portfolios
        })
    }
})

export { handler }
