import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holding = await client`
        WITH cte AS (
            SELECT COALESCE(t.quantity - SUM(s.quantity), t.quantity) AS current_quantity,
                   a.type AS asset_type
            FROM transactions AS t
                LEFT JOIN sells AS s ON t.id = s.transaction_id
                INNER JOIN holdings AS h ON h.id = t.holding_id
                INNER JOIN assets AS a ON a.id = h.asset_id
            WHERE t.type = 0 AND t.holding_id = ${eventBody.holdingId}
            GROUP BY t.id, a.id
        )
        SELECT SUM(cte.current_quantity) AS current_quantity,
               cte.asset_type
       FROM cte
       GROUP BY cte.asset_type;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: holding[0]
        })
    }
})

export { handler }
