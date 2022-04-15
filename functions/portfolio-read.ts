import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)
    const portfolio = await client`SELECT id, name, included FROM portfolios WHERE id = ${eventBody.portfolioId};`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: portfolio
        })
    }
}

export { handler }
