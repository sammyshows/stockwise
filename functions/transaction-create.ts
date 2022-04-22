import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate) 
        VALUES (${eventBody.holding}, ${eventBody.type}, ${eventBody.quantity}, ${eventBody.initialPrice}, ${eventBody.exchangeRate})`

    return {
        statusCode: 200
    }
}

export { handler }
