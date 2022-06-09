import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const quote = await fetch(`${process.env.DOMAIN}/api/iex-quote-forex`, {
        headers: {
            authorization: 'Bearer ' + eventBody.token
        },
        method: 'POST',
        body: JSON.stringify({
            from: eventBody.from,
            to: eventBody.to
        })
    })
        .then(response => response.json())

    const createdAsset = await client`
        INSERT INTO assets (symbol, current_price, prev_close, name, type)
        VALUES (${eventBody.from + eventBody.to},
                ${quote["currentPrice"]},
                ${quote["prevClose"]},
                ${quote["name"]},
                1)
        ON CONFLICT (symbol)
        WHERE NOT (type = 3)
            DO UPDATE SET current_price = ${quote["currentPrice"]}
        RETURNING id;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: createdAsset[0]
        })
    }
})

export { handler }
