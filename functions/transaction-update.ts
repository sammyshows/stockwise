import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        UPDATE transactions
        SET type = ${eventBody.type},
            quantity = ${eventBody.quantity},
            initial_price = ${eventBody.initialPrice},
            exchange_rate = ${eventBody.exchangeRate}
        WHERE id = ${eventBody.id};`

    return {
        statusCode: 200
    }
}

export { handler }
