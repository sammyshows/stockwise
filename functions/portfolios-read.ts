import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    // const portfolios = await client`
    //     SELECT portfolios.id,
    //            portfolios.name,
    //            COUNT(holdings.id) as holding_count,
    //            SUM(initial_value) as initial_value,
    //            SUM(current_price*share_count) as current_value,
    //            SUM((current_price - prev_close) * share_count) as daily_change,
    //            SUM(current_price*share_count - initial_value) as total_change,
    //            SUM(realized) as realized,
    //            SUM(realized_initial) as realized_initial,
    //            SUM(COALESCE(all_time_initial, initial_value)) as all_time_initial
    //     FROM portfolios
    //          LEFT JOIN holdings ON portfolios.id = holdings.portfolio_id
    //          LEFT JOIN assets ON holdings.asset_id = assets.id
    //     WHERE portfolios.user_id = ${eventBody.uuid}
    //     GROUP BY portfolios.id
    //     ORDER BY portfolios.created_at;`

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
        SELECT c.portfolio_id,
               c.portfolio_name,
               SUM(c.current_quantity) AS current_quantity,
               SUM(c.initial_value) as initial_value,
               SUM(c.current_value) AS current_value,
               SUM(c.daily_change) AS daily_change,
               SUM(c.realized) AS realized,
               SUM(c.realized_initial) AS realized_initial,
               SUM(c.all_time_initial) AS all_time_initial
        FROM cte AS c
        GROUP BY c.portfolio_id, c.portfolio_name;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            portfolios: portfolios
        })
    }
})

export { handler }
