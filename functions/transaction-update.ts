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
            exchange_rate = ${eventBody.exchangeRate || null},
            timestamp = ${eventBody.timestamp}
        WHERE id = ${eventBody.transactionId};`

    const createSells = () => fetch(process.env.DOMAIN + '/api/sells-create', {
        headers: {
            authorization: eventBody.token
        },
        method: 'POST',
        body: JSON.stringify({
            holdingId: eventBody.holdingId
        })
    })

    const createSplits = () => fetch(process.env.DOMAIN + '/api/transactions-split-create', {
        headers: {
            authorization: eventBody.token
        },
        method: 'POST',
        body: JSON.stringify({
            holdingId: eventBody.holdingId
        })
    })

    await Promise.all([createSells(), createSplits()])

    return {
        statusCode: 200
    }
})

export { handler }
