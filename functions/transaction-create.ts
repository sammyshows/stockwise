import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts");
const { BigNumber } = require('bignumber.js');



const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) 
        VALUES (${eventBody.holdingId}, ${eventBody.type}, ${eventBody.type === 1 ? eventBody.quantity * -1 : eventBody.quantity}, ${eventBody.initialPrice}, ${eventBody.exchangeRate || null}, ${eventBody.timestamp})`

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
