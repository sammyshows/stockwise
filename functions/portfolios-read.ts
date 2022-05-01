import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async () => {
    const portfolios = await client`
        SELECT portfolios.id,
               portfolios.name,
               COUNT(holdings.id) as holding_count,
               SUM(initial_value) as initial_value,
               SUM(current_price*share_count) as current_value,
               SUM((current_price - prev_close) * share_count) as daily_change,
               SUM((current_price - prev_close)*100 / prev_close) as daily_percent,
               SUM(current_price*share_count - initial_value) as total_change
        FROM portfolios
             LEFT JOIN holdings ON portfolios.id = holdings.portfolio_id
             LEFT JOIN assets ON holdings.asset_id = assets.id
        GROUP BY portfolios.id
        ORDER BY portfolios.created_at;
    `

    return {
        statusCode: 200,
        body: JSON.stringify({
            portfolios: portfolios
        })
    }
}

export { handler }
