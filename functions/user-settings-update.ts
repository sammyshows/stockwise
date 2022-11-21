import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        UPDATE user_settings
        SET currency_id = (SELECT id FROM assets WHERE symbol = ${'USD' + eventBody.currency} AND type = 1)
        WHERE id = ${eventBody.id};`

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
})

export { handler }
