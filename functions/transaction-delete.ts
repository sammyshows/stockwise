import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        DELETE FROM transactions WHERE id = ${eventBody.transactionId}`

    await client`
        CALL uspUpdateHolding(${eventBody.holdingId});`

    return {
        statusCode: 200
    }
}

export { handler }
