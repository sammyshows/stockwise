import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        DELETE FROM transactions WHERE id = ${eventBody.transactionId}`

    const createSells = async () => fetch(process.env.DOMAIN + '/api/sells-create', {
        headers: {
            authorization: eventBody.token
        },
        method: 'POST',
        body: JSON.stringify({
            holdingId: eventBody.holdingId
        })
    })

    const createSplits = async () => fetch(process.env.DOMAIN + '/api/transactions-split-create', {
        headers: {
            authorization: eventBody.token
        },
        method: 'POST',
        body: JSON.stringify({
            holdingId: eventBody.holdingId
        })
    })

    await Promise.all([await createSplits(), await createSells()])

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
})

export { handler }
