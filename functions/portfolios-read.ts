import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const portfolios = await client`
        WITH cte AS (
            SELECT p.id AS portfolio_id,
                   h.id AS holding_id,
                   p.name AS portfolio_name,
                   p.included AS portfolio_included,
                   SUBSTRING(user_c.symbol, 4, 6) AS currency_symbol,
                   (t.quantity - COALESCE(SUM(s.quantity), 0)) * t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price) as initial_value,
                   a.current_price * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price AS current_value,
                   (a.current_price - a.prev_close) * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price AS daily_change,
                   SUM(s.quantity * (s.sell_price * COALESCE(s.exchange_rate, asset_c.current_price * user_c.current_price) - t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))) AS realized,
                   SUM(s.quantity * (t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))) AS realized_initial,
                   t.initial_value * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price) AS all_time_initial
            FROM portfolios AS p
                LEFT JOIN holdings AS h ON p.id = h.portfolio_id
                LEFT JOIN assets AS a ON h.asset_id = a.id
                INNER JOIN user_settings AS u ON p.user_id = u.user_id
                LEFT JOIN assets AS asset_c ON a.currency_id = asset_c.id
                LEFT JOIN assets AS user_c ON u.currency_id = user_c.id
                LEFT JOIN transactions AS t ON t.type = 0 AND h.id = t.holding_id
                LEFT JOIN sells AS s ON t.id = s.transaction_id
            WHERE u.user_id = ${eventBody.uuid}
            GROUP BY p.id, h.id, a.id, p.id, asset_c.id, user_c.id, t.id
            ORDER BY p.created_at
        )
        SELECT cte.portfolio_id,
               cte.portfolio_name,
               cte.portfolio_included,
               cte.currency_symbol,
               COUNT(DISTINCT cte.holding_id) AS holding_count,
               SUM(cte.initial_value) as initial_value,
               SUM(cte.current_value) AS current_value,
               SUM(cte.daily_change) AS daily_change,
               SUM(cte.realized) AS realized,
               SUM(cte.realized_initial) AS realized_initial,
               SUM(cte.all_time_initial) AS all_time_initial
        FROM cte
        GROUP BY cte.portfolio_id, cte.portfolio_included, cte.portfolio_name, cte.currency_symbol;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            portfolios: portfolios
        })
    }
})

export { handler }
