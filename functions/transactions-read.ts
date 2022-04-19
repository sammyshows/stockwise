import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const holdings = await client`SELECT * FROM uspReadTransactions(${eventBody.holdingId})`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: holdings
        })
    }
}

export { handler }
