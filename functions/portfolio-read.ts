import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const portfolio = await client`
        SELECT id, 
               name AS portfolio_name,
               included,
               hide_closed_positions
        FROM portfolios 
        WHERE id = ${eventBody.portfolioId};`

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200,
        body: JSON.stringify({
            data: portfolio
        })
    }
})

export { handler }
