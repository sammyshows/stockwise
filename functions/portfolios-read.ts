import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const portfolios = await client`
        WITH cte AS (
            SELECT p.id AS portfolio_id,
                   p.name AS portfolio_name,
                   a.current_price AS current_price,
                   t.quantity - COALESCE(SUM(s.quantity), 0) as current_quantity,
                   a.symbol AS symbol,
                   a.name AS asset_name,
                   (t.quantity - COALESCE(SUM(s.quantity), 0)) * t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price) as initial_value,
                   a.current_price * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price AS current_value,
                   (a.current_price - a.prev_close) * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price AS daily_change,
                   SUM(s.quantity * (s.sell_price * COALESCE(s.exchange_rate, asset_c.current_price * user_c.current_price) - t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))) AS realized,
                   SUM(s.quantity * (t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))) AS realized_initial,
                   t.initial_value * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price) AS all_time_initial
            FROM holdings AS h
                INNER JOIN portfolios AS p ON h.portfolio_id = p.id
                INNER JOIN assets AS a ON h.asset_id = a.id
                INNER JOIN users AS u ON p.user_id = u.id
                INNER JOIN assets AS asset_c ON a.currency_id = asset_c.id
                INNER JOIN assets AS user_c ON u.currency_id = user_c.id
                INNER JOIN transactions AS t ON h.id = t.holding_id
                LEFT JOIN sells AS s ON t.id = s.transaction_id
            WHERE u.id = ${eventBody.uuid} AND t.type = 0
            GROUP BY p.id, a.id, p.id, asset_c.id, user_c.id, t.id
            ORDER BY p.created_at
        )
        SELECT cte.portfolio_id,
               cte.portfolio_name,
               SUM(cte.current_quantity) AS current_quantity,
               SUM(cte.initial_value) as initial_value,
               SUM(cte.current_value) AS current_value,
               SUM(cte.daily_change) AS daily_change,
               SUM(cte.realized) AS realized,
               SUM(cte.realized_initial) AS realized_initial,
               SUM(cte.all_time_initial) AS all_time_initial
        FROM cte
        GROUP BY cte.portfolio_id, cte.portfolio_name;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            portfolios: portfolios
        })
    }
})

export { handler }
