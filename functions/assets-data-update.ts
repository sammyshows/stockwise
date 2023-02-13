import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")
import fetch from 'node-fetch'

const handler: Handler = async (event, context) => {
    const assets = await client`
        SELECT DISTINCT a.id, a.symbol FROM assets AS a LEFT OUTER JOIN holdings AS h ON h.asset_id = a.id WHERE type = 0 AND h.asset_id IS NOT NULL;`

    const allSymbols = assets.map(obj => obj.symbol)
    let symbolIds = {}
    assets.forEach(obj => symbolIds[obj.symbol] = obj.id)

    // Use the symbols from above to do a batch call to the IEX Cloud API for historicalData on all of them.
    // At the time of writing a batch is limited to 100 symbols at a time, so when we surpass that, we should split the
    // symbols array into groups of 100 and call each group individually
    let data;
    data = await fetch(`https://cloud.iexapis.com/stable/stock/market/batch?symbols=${allSymbols.join(',')}&types=chart&range=5y&includeToday=true&chartCloseOnly=true&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())

    let assetArrays = Object.values(data)
    assetArrays = assetArrays.map(asset => Object.values(asset))

    allSymbols.forEach((symbol) => {
        const id = symbolIds[symbol]
        data[symbol].chart.forEach(assetData => {
            assetData["id"] = id
        })
    })

    const historicalData = assetArrays.flat(2)
    const ids = historicalData.map(asset => asset["id"])

    const closes = historicalData.map(asset => asset["close"])
    const labels = historicalData.map(asset => {
        const date = new Date(asset["date"])
        return date.toDateString().slice(4)
    })
    const dates = historicalData.map(asset => asset["date"])

    await client`
        DELETE FROM partman.asset_data`

    await client`
    WITH asset_data (asset_id, close, label, date) AS (
        SELECT * 
        FROM 
            UNNEST(
                ${ids}::UUID[],
                ${closes}::NUMERIC[],
                ${labels}::TEXT[],
                ${dates}::DATE[]
            )
    )
    INSERT INTO partman.asset_data (asset_id, close, label, date)
    SELECT asset_id,
           close,
           label,
           date
    FROM asset_data`

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
}

export { handler }
