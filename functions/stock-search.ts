import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const data = await fetch(`https://cloud.iexapis.com/stable/search/${eventBody.searchTerm}?token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: data
        })
    }
})

export { handler }
