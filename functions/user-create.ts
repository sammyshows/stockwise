import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
// const { requireAuth } = require('../api/auth');


const handler: Handler = async (event, context) => {
    console.log(event)
    const eventBody = JSON.parse(event.body)

    console.log(eventBody)

    await client`
        INSERT INTO users (id, email, account_type)
        VALUES (${eventBody.uuid}, ${eventBody.email}, ${eventBody.accountType || 0});`

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
}

export { handler }
