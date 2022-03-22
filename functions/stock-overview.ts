import { Handler } from "@netlify/functions";
import fetch from 'node-fetch'

const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const data = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${eventBody.symbol}&apikey=B642KXFN4VUO0FC2`)
        .then(response => response.json())

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: data
        })
    }
}

export { handler }