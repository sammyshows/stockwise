import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async () => {
    let portfolios = []

    const portfolioIds = await client`
        SELECT portfolio_id, name FROM portfolios;`

    await Promise.all(portfolioIds.map(async (portfolioId) => {
        await client`
            SELECT COUNT(*) AS transaction_count,
                   ROUND(Sum(initial_price*quantity), 2) AS initial_value,
                   ROUND(Sum(current_price*quantity), 2) AS current_value,
                   ROUND((Sum(current_price*quantity)-Sum(initial_price*quantity))*100.0 / Sum(initial_price*quantity), 2) AS total_percent,
                   ROUND(Sum(current_price*quantity)-Sum(prev_close*quantity), 2) AS daily_value,
                   ROUND((Sum(current_price*quantity)-Sum(prev_close*quantity))*100.0 / Sum(prev_close*quantity), 2) AS daily_percent
            FROM transactions
                INNER JOIN holdings ON holdings.holding_id = transactions.holding_id 
                INNER JOIN assets ON holdings.asset_id = assets.asset_id 
            WHERE portfolio_id = ${portfolioId.portfolio_id};`
                .then(response => {
                    let portfolio = {
                        id: portfolioId.portfolio_id,
                        name: portfolioId.name,
                        data: response[0]
                    }
                    portfolios.push(portfolio)
                })
    }))

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: portfolios
        })
    }
}

export { handler }
