import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');


const handler: Handler = requireAuth(async (event, context) => {
    await client`CALL partman.run_maintenance_proc();`

    return {
        statusCode: 200
    }
})

export { handler }
