import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)
    const data = await fetch(`https://cloud.iexapis.com/stable/fx/latest?symbols=${eventBody.symbol}&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    return {
        statusCode: 200,
        body: JSON.stringify({
            rate: data[0].rate
        })
    }
})

export { handler }
