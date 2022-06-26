import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');


const handler: Handler = requireAuth(async (event, context) => {
    await client`SELECT partman.run_maintenance(partman.portfolio_data);`

    return {
        statusCode: 200
    }
})

export { handler }
