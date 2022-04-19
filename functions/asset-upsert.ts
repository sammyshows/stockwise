import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
import fetch from 'node-fetch'

const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)
    const asset = await fetch('http://localhost:8888/api/stock-quote', {
        method: 'POST',
        body: JSON.stringify({
            symbol: eventBody.symbol
        })
    })
        .then(response => response.json())
        .then(asset => asset["quote"])

    await client`
        INSERT INTO assets (symbol, current_price, prev_close, name, exchange)
        VALUES (
                ${asset.symbol}, 
                ${asset.latestPrice}, 
                ${asset.previousClose}, 
                ${asset.companyName || eventBody.name }, 
                ${asset.primaryExchange || eventBody.exchange})
        ON CONFLICT (symbol) 
            DO UPDATE SET current_price = ${asset.latestPrice},
                          name = ${asset.companyName || eventBody.name },
                          exchange = ${asset.primaryExchange || eventBody.exchange};
    `

    return {
        statusCode: 200
    }
}

export { handler }
