import { Handler } from "@netlify/functions";
import fetch from 'node-fetch'

const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const data = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${eventBody.searchTerm}&apikey=B642KXFN4VUO0FC2`, {
        "method": "GET"
    })
        .then(response => response.json())

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: data
        })
    }
}

export { handler }
