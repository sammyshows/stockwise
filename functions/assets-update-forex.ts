import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async () => {
    // Get all the asset symbols
    const forexAssets = await client`
        SELECT symbol
        FROM assets 
        WHERE type = 1;`

    const forexSymbolArray = forexAssets.map(stock => stock.symbol)

    // Use the symbols from above to do a batch call to the IEX Cloud API for quotes on all of them.
    // At the time of writing a batch is limited to 100 symbols at a time, so when we surpass that, we should split the
    // symbols array into groups of 100 and call each group individually
    let forexData;
    forexData = await fetch(`https://cloud.iexapis.com/stable/fx/latest?symbols=${forexSymbolArray.join(',')}&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    // Sometimes a quote will have null price fields (generally the niche quotes), but Postgres expects that this data
    // be typed if we want to UNNEST it (below). Therefore, we use a NUMERIC type for prices and filter out the null values

    const forexFilteredData = forexData.filter(forex => forex.symbol && forex.rate)

    // Get an array of all values for each required field. Then we can turn these into rows and use them in the update below

    const forexSymbols = forexData.map(forex => forex.symbol)
    const forexRates = forexData.map(forex => forex.rate)

    await client`
    WITH asset (symbol, current_price) AS (
        SELECT * 
        FROM 
            UNNEST(
                ${forexSymbols}::TEXT[],
                ${forexRates}::NUMERIC[]
            )
    )
    UPDATE 
        assets
        SET current_price = asset.current_price,
            prev_close = asset.current_price
        FROM asset
        WHERE assets.symbol = asset.symbol AND type = 1;`

    return {
        statusCode: 200
    }
})

export { handler }