import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async () => {
    // Get all the asset symbols
    const assets = await client`
        SELECT symbol FROM assets;`
            .then(response => response.map(obj => obj.symbol))

    // Use the symbols from above to do a batch call to the IEX Cloud API for quotes on all of them.
    // At the time of writing a batch is limited to 100 symbols at a time, so when we surpass that, we should split the
    // symbols array into groups of 100 and call each group individually
    const data = await fetch(`https://cloud.iexapis.com/stable/stock/market/batch?symbols=${assets.join(',')}&types=quote&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    // Sometimes a quote will have null price fields (generally the niche quotes), but Postgres expects that this data
    // be typed if we want to UNNEST it (below). Therefore, we use a NUMERIC type for prices and filter out the null values
    const filteredData = Object.values(data).filter(asset => asset.quote.symbol && asset.quote.latestPrice && asset.quote.previousClose)

    // Get an array of all values for each required field. Then we can turn these into rows and use them in the update below
    const symbols = Object.values(filteredData).map(asset => asset.quote.symbol)
    const current_prices = Object.values(filteredData).map(asset => asset.quote.latestPrice)
    const prev_closes = Object.values(filteredData).map(asset => asset.quote.previousClose)

    await client`
    WITH asset (symbol, current_price, prev_close) AS (
        SELECT * 
        FROM 
            UNNEST(
                ${symbols}::TEXT[],
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
})

export { handler }