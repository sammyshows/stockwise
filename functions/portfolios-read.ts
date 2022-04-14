import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async () => {
    const portfolios = await client`SELECT * FROM uspReadPortfolios();`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: portfolios
        })
    }
}

export { handler }
