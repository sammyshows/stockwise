import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holdings = await client`
        WITH cte AS (
            SELECT h.id AS holding_id,
                   p.id AS portfolio_id,
                   a.current_price AS current_price,
                   a.symbol AS symbol,
                   a.name AS asset_name,
                   a.type AS asset_type,
                   SUBSTRING(asset_c.symbol, 1, 3) AS currency_symbol,
                   CASE t.type
                       WHEN 0 THEN (t.quantity - COALESCE(SUM(s.quantity), 0)) * t.initial_price 
                   END AS initial_value_asset_c,
                   CASE t.type 
                       WHEN 0 THEN t.quantity - COALESCE(SUM(s.quantity), 0) 
                       WHEN 3 THEN t.quantity - COALESCE(SUM(s.quantity), 0) 
                       WHEN 2 THEN 0 
                   END AS current_quantity,
                   CASE t.type 
                       WHEN 0 THEN (t.quantity - COALESCE(SUM(s.quantity), 0)) * t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price) 
                   END as initial_value,
                   CASE t.type 
                       WHEN 0 THEN a.current_price * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price 
                       WHEN 3 THEN a.current_price * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price 
                   END AS current_value,
                   CASE t.type
                       WHEN 0 THEN (a.current_price - a.prev_close) * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price
                       WHEN 3 THEN (a.current_price - a.prev_close) * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price
                   END AS daily_change,
                   CASE t.type 
                       WHEN 0 THEN COALESCE(SUM(s.quantity * (s.sell_price * COALESCE(s.exchange_rate, asset_c.current_price * user_c.current_price) - t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))), 0)
                       WHEN 2 THEN COALESCE((t.initial_price * t.quantity * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price)), 0)
                       WHEN 3 THEN COALESCE(SUM(s.quantity * (s.sell_price * COALESCE(s.exchange_rate, asset_c.current_price * user_c.current_price))), 0)
                   END AS realized,
                   CASE t.type
                       WHEN 0 THEN COALESCE(SUM(s.quantity * (t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))), 0)
                       ELSE 0
                   END AS realized_initial,
                   CASE t.type 
                       WHEN 0 THEN t.initial_value * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price)
                       ELSE 0
                   END AS all_time_initial
            FROM holdings AS h
                     INNER JOIN portfolios AS p ON h.portfolio_id = p.id
                     INNER JOIN assets AS a ON h.asset_id = a.id
                     INNER JOIN user_settings AS u ON p.user_id = u.user_id
                     INNER JOIN assets AS asset_c ON a.currency_id = asset_c.id
                     INNER JOIN assets AS user_c ON u.currency_id = user_c.id
                     INNER JOIN transactions AS t ON h.id = t.holding_id
                     LEFT JOIN sells AS s ON t.id = s.transaction_id
            WHERE p.id = ${eventBody.portfolioId} AND t.type != 1
            GROUP BY h.id, a.id, p.id, asset_c.id, user_c.id, t.id
            ORDER BY h.created_at
        )
        SELECT cte.holding_id,
               cte.portfolio_id,
               cte.current_price,
               SUM(cte.initial_value_asset_c) / NULLIF(SUM(cte.current_quantity), 0) AS avg_initial_price,
               SUM(cte.current_quantity) AS current_quantity,
               cte.symbol,
               cte.asset_name,
               cte.asset_type,
               cte.currency_symbol,
               SUM(cte.initial_value) as initial_value,
               SUM(cte.current_value) AS current_value,
               SUM(cte.daily_change) AS daily_change,
               SUM(cte.realized) AS realized,
               SUM(cte.realized_initial) AS realized_initial,
               SUM(cte.all_time_initial) AS all_time_initial
        FROM cte
        GROUP BY cte.holding_id, cte.portfolio_id, cte.current_price, cte.symbol, cte.asset_name, cte.asset_type, cte.currency_symbol;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: holdings
        })
    }
})

export { handler }
