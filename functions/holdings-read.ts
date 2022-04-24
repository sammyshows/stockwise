import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holdings = await client`
        SELECT holdings.id,
               portfolios.name,
               assets.symbol,
               assets.exchange,
               assets.name,
               transaction_count, 
               ROUND(initial_value, 2) as initial_value,
               ROUND(current_price*share_count, 2) AS current_value, 
               ROUND((current_price - prev_close) * share_count, 2) AS daily_change,
               ROUND((current_price - prev_close)*100 / prev_close, 2) AS daily_percent,
               ROUND(current_price*share_count - initial_value, 2) AS total_change
        FROM holdings 
            INNER JOIN assets ON holdings.asset_id = assets.id 
            INNER JOIN portfolios ON holdings.portfolio_id = portfolios.id 
        WHERE portfolios.id = ${eventBody.portfolioId};
    `

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: holdings
        })
    }
}

export { handler }
