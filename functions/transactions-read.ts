import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)
    let transactions
    let assetData

    const getTransactions = () => client`SELECT * FROM uspReadTransactions(${eventBody.holdingId})`

    const getAssetData = () => client`
        SELECT a.id, 
               a.type, 
               a.current_price, 
               a.prev_close,
               a.symbol, 
               a.exchange, 
               a.name,
               SUBSTRING(asset_c.symbol, 4, 6) AS currency_symbol
        FROM assets AS a
        INNER JOIN assets AS asset_c ON asset_c.id = a.currency_id
        INNER JOIN holdings AS h ON h.asset_id = a.id
        WHERE h.id = ${eventBody.holdingId}`
        .then(response => response[0])

    await Promise.all([getTransactions(), getAssetData()])
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
