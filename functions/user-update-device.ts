import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        UPDATE users
        SET device_model = ${eventBody.deviceModel},
            device_os = ${eventBody.deviceOS},
            stockwise_version = ${eventBody.stockwiseVersion}
        WHERE users.id = ${eventBody.userId};`

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
})

export { handler }
