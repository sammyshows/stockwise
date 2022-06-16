import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holding = await client`
        SELECT SUM(t.quantity) AS current_quantity,
               a.type 
        FROM transactions AS t
            INNER JOIN holdings AS h ON h.id = t.holding_id
            INNER JOIN assets AS a ON a.id = h.asset_id
        WHERE t.holding_id = ${eventBody.holdingId}
        GROUP BY a.type;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: holding[0]
        })
    }
})

export { handler }
