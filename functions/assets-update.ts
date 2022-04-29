import { Handler } from "@netlify/functions";
import fetch from 'node-fetch'
const client = require("../database/client.ts")

const handler: Handler = async () => {

    const assets = await client`
        SELECT symbol FROM assets;`
        .then(response => response.map(obj => obj.symbol))

    const data = await fetch(`https://cloud.iexapis.com/stable/stock/market/batch?symbols=${assets.join(',')}&types=quote&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    let current_prices = Object.values(data).map(asset => asset.quote.latestPrice)
    let prev_closes = Object.values(data).map(asset => asset.quote.previousClose)

    await client`
    WITH asset (symbol, current_price, prev_close) AS (
        SELECT 
           * 
        FROM 
            unnest(
                ${Object.keys(data)}::TEXT[],
                ${current_prices}::NUMERIC[],
                ${prev_closes}::NUMERIC[]
            )
    )
    UPDATE 
        assets
        SET current_price = asset.current_price,
            prev_close = asset.prev_close
        FROM asset
        WHERE assets.symbol = asset.symbol;`


    return {
        statusCode: 200
    }
}

export { handler }