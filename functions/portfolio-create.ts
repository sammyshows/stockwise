import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        INSERT INTO portfolios (user_id, name, included) 
        VALUES (${eventBody.userId}, ${eventBody.name}, ${eventBody.included})`

    return {
        statusCode: 200
    }
})

export { handler }
