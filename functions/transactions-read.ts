import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)
    let transactions
    let assetData

    const getTransactions = client`SELECT * FROM uspReadTransactions(${eventBody.holdingId})`

    const getAssetData = client`
        SELECT assets.id, current_price, prev_close, currency, symbol, exchange, name
        FROM assets
        INNER JOIN holdings AS h ON h.asset_id = assets.id
        WHERE h.id = ${eventBody.holdingId}`
        .then(response => response[0])

    await Promise.all([getTransactions, getAssetData])
        .then(result => {
            transactions = result[0]
            assetData = result[1]
        })

    return {
        statusCode: 200,
        body: JSON.stringify({
            transactions: transactions,
            assetData: assetData
        })
    }
})

export { handler }
