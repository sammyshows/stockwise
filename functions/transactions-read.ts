import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)
    let transactions
    let assetData

    const getTransactions = () => client`
        SELECT t.id AS transaction_id,
               h.id AS holding_id,
               a.type AS asset_type,
               SUBSTRING(asset_c.symbol, 1, 3) AS currency_symbol,
               t.type AS type,
               t.sell_method AS sell_method,
               t.exchange_rate AS exchange_rate,
               t.timestamp AS datetime,
               t.split_multiplier AS split_multiplier,
               t.quantity * t.split_multiplier AS initial_quantity,
               COALESCE(t.quantity * t.split_multiplier - SUM(s.quantity), t.quantity * t.split_multiplier) AS current_quantity,
               t.initial_price AS price,
               (t.quantity * t.split_multiplier - COALESCE(SUM(s.quantity), 0)) * t.initial_price / t.split_multiplier * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price) AS initial_value,
               COALESCE(a.current_price * (t.quantity * t.split_multiplier - SUM(s.quantity)), a.current_price * t.quantity * t.split_multiplier) * asset_c.current_price * user_c.current_price AS current_value,
               ((a.current_price * asset_c.current_price * user_c.current_price) - (t.initial_price / t.split_multiplier * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))) * (t.quantity * t.split_multiplier - COALESCE(SUM(s.quantity), 0)) AS total_change,
               ((a.current_price * (t.quantity * t.split_multiplier - COALESCE(SUM(s.quantity), 0))) - (a.prev_close * (t.quantity * t.split_multiplier - COALESCE(SUM(s.quantity), 0)))) * asset_c.current_price * user_c.current_price AS daily_change,
               COALESCE(((a.current_price * (t.quantity * t.split_multiplier - SUM(s.quantity))) - (a.prev_close * (t.quantity * t.split_multiplier - SUM(s.quantity)))) * 100.0 / NULLIF(a.prev_close * (t.quantity * t.split_multiplier - SUM(s.quantity)), 0), ((a.current_price * t.quantity * t.split_multiplier) - (a.prev_close * t.quantity * t.split_multiplier))*100.0 / (a.prev_close * t.quantity * t.split_multiplier)) AS daily_percent,
               CASE t.type
                   WHEN 0 THEN SUM(s.quantity * (s.sell_price * COALESCE(s.exchange_rate, asset_c.current_price * user_c.current_price) - t.initial_price / t.split_multiplier * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price)))
                   WHEN 2 THEN t.quantity * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price)
                   WHEN 3 THEN SUM(s.quantity * (s.sell_price * COALESCE(s.exchange_rate, asset_c.current_price * user_c.current_price)))
                   END AS realized,
               CASE t.type
                   WHEN 0 THEN COALESCE(SUM(s.quantity * (t.initial_price / t.split_multiplier * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))), 0)
                   ELSE 0
                   END AS realized_initial,
               CASE t.type
                   WHEN 0 THEN t.initial_value * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price)
                   ELSE 0
                   END AS all_time_initial
        FROM transactions as t
                 INNER JOIN holdings AS h ON t.holding_id = h.id
                 INNER JOIN assets AS a ON h.asset_id = a.id
                 INNER JOIN portfolios AS p ON h.portfolio_id = p.id
                 INNER JOIN user_settings AS u ON p.user_id = u.user_id
                 INNER JOIN assets AS asset_c ON a.currency_id = asset_c.id
                 INNER JOIN assets AS user_c ON u.currency_id = user_c.id
                 LEFT JOIN sells AS s ON t.id = s.transaction_id
        WHERE h.id = ${eventBody.holdingId}
        GROUP BY t.id, h.id, a.id, s.transaction_id, asset_c.id, user_c.id
        ORDER BY MIN(t.timestamp) DESC;`

    const getAssetData = () => client`
        SELECT a.id,
               a.type, 
               a.current_price, 
               a.prev_close,
               a.symbol, 
               a.exchange, 
               a.name,
               SUBSTRING(asset_c.symbol, 1, 3) AS currency_symbol
        FROM assets AS a
        LEFT JOIN assets AS asset_c ON asset_c.id = a.currency_id
        INNER JOIN holdings AS h ON h.asset_id = a.id
        WHERE h.id = ${eventBody.holdingId}`
        .then(response => response[0])

    await Promise.all([getTransactions(), getAssetData()])
        .then(result => {
            transactions = result[0]
            assetData = result[1]
        })

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200,
        body: JSON.stringify({
            transactions: transactions,
            assetData: assetData
        })
    }
})

export { handler }
