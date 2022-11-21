import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        UPDATE portfolios
        SET name = ${eventBody.portfolio_name},
            included = ${eventBody.included},
            hide_closed_positions = ${eventBody.hide_closed_positions}
        WHERE id = ${eventBody.id};`


    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
})

export { handler }
