import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async () => {
    const portfolios = await client`
        SELECT portfolios.id,
               portfolios.name,
               COUNT(holdings.id) as holding_count,
               ROUND(SUM(initial_value), 2) as initial_value,
               ROUND(SUM(current_price*share_count), 2) as current_value,
               ROUND(SUM((current_price - prev_close) * share_count), 2) as daily_change,
               ROUND(SUM((current_price - prev_close)*100 / prev_close), 2) as daily_percent,
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
