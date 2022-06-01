import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        DELETE FROM portfolios WHERE id = ${eventBody.portfolioId}`

    return {
        statusCode: 200
    }
})

export { handler }
