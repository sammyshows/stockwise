import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        UPDATE transactions
        SET type = ${eventBody.type},
            quantity = ${eventBody.quantity},
            initial_price = ${eventBody.initialPrice},
            exchange_rate = ${eventBody.exchangeRate},
            timestamp = ${eventBody.timestamp}
        WHERE id = ${eventBody.transactionId};`

    await client`
        CALL uspUpdateHolding(${eventBody.holdingId});`

    return {
        statusCode: 200
    }
}

export { handler }
