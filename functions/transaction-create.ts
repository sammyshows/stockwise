import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) 
        VALUES (${eventBody.holdingId}, ${eventBody.type}, ${eventBody.quantity}, ${eventBody.initialPrice}, ${eventBody.exchangeRate || null}, ${eventBody.timestamp});`

    return {
        statusCode: 200
    }
})

export { handler }
