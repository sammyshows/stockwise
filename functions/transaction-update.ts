import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        UPDATE transactions
        SET type = ${eventBody.type},
            quantity = ${eventBody.quantity},
            initial_price = ${eventBody.initialPrice},
            exchange_rate = ${eventBody.exchangeRate},
            timestamp = ${eventBody.timestamp}
        WHERE id = ${eventBody.transactionId};`

    await fetch(process.env.DOMAIN + '/api/sells-create', {
        headers: {
            authorization: 'Bearer ' + eventBody.token
        },
        method: 'POST',
        body: JSON.stringify({
            holdingId: eventBody.holdingId
        })
    })

    return {
        statusCode: 200
    }
})

export { handler }
