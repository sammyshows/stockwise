import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts");


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)


    await client`
        INSERT INTO transactions (holding_id, type, sell_method, quantity, initial_price, exchange_rate, timestamp) 
        VALUES (
            ${eventBody.holdingId},
            ${eventBody.type}, 
            ${eventBody.sellMethod}, 
            ${eventBody.quantity}, 
            ${eventBody.initialPrice},
            ${eventBody.exchangeRate},
            ${eventBody.timestamp}
        )`


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
