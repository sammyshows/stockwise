import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        DELETE FROM transactions WHERE id = ${eventBody.transactionId}`

    return {
        statusCode: 200
    }
}

export { handler }
