import { Handler } from "@netlify/functions";
import fetch from 'node-fetch'

const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const data = await fetch(`https://cloud.iexapis.com/stable/stock/${eventBody.symbol}/advanced-stats?token=${process.env.IEXTOKEN}`)
        .then(response => response.json())
        .catch(error => console.error(error))

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: data
        })
    }
}

export { handler }