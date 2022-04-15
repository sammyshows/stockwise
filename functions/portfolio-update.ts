import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)
    const portfolio = JSON.parse(eventBody.portfolio)

    await client`
        UPDATE portfolios
        SET name = ${portfolio.name},
            included = ${portfolio.included}
        WHERE id = ${portfolio.id};`


    return {
        statusCode: 200
    }
}

export { handler }
