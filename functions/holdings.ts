import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holdings = await client`
        SELECT
            holdings.holding_id AS id,
            symbol,
            portfolios.name as portfolio,
            COUNT(transactions) AS transaction_count,
            ROUND(Sum(initial_price*quantity), 2) AS initial_value,
            ROUND(Sum(current_price*quantity), 2) AS current_value,
            ROUND((Sum(current_price*quantity)-Sum(initial_price*quantity))*100.0 / Sum(initial_price*quantity), 2) AS total_percent,
            ROUND(Sum(current_price*quantity)-Sum(prev_close*quantity), 2) AS daily_value,
            ROUND((Sum(current_price*quantity)-Sum(prev_close*quantity))*100.0 / Sum(prev_close*quantity), 2) AS daily_percent
        FROM transactions 
            INNER JOIN holdings ON holdings.holding_id = transactions.holding_id
            INNER JOIN assets ON holdings.asset_id = assets.asset_id
            INNER JOIN portfolios ON holdings.portfolio_id = portfolios.portfolio_id
        WHERE portfolios.portfolio_id = ${eventBody.portfolioId}
        GROUP BY holdings.holding_id, assets.asset_id, portfolios.portfolio_id;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: holdings
        })
    }
}

export { handler }
