import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holdings = await client`SELECT * FROM uspReadTransactions(${eventBody.holdingId})`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: holdings
        })
    }
})

export { handler }
