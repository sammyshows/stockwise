import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts");
const { BigNumber } = require('bignumber.js');



const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    // Get all tx available share quantities for this holding.
    const getTxs = async (): Promise<Array<object>> => {
        return await client`
            SELECT id,
                   type,
                   quantity,
                   initial_price,
                   split_multiplier,
                   exchange_rate
            FROM transactions AS t
            WHERE holding_id = ${eventBody.holdingId}
            ORDER BY timestamp ASC;`
    }


    const deleteSells = async () => {
        await client`
            DELETE
            FROM sells USING transactions AS t
            WHERE sells.transaction_id = t.id AND t.holding_id = ${eventBody.holdingId}`
    }

    let buyTxs
    let sellTxs
    await Promise.all([getTxs(), deleteSells()])
      .then(result => {
          buyTxs = result[0].filter(tx => tx.type === 0 || tx.type === 3)
          sellTxs = result[0].filter(tx => tx.type === 1)
      })

    console.log('sells', sellTxs)
    // Go through the txs and sell the as many shares as necessary until the total sell quantity has been met.
    let sellQuantity
    for (const sellTx of sellTxs) {
        let unallocatedQuantity = new BigNumber(sellTx.quantity)
        while (unallocatedQuantity.isGreaterThan(0)) {
            let buyTx = buyTxs[0]

            // If this buyTx has less shares than are required to sell, be sure to sell all you can of this buyTx anyway.
            if (unallocatedQuantity.isGreaterThanOrEqualTo(BigNumber(buyTx.quantity).times(buyTx.split_multiplier))) {
                sellQuantity = BigNumber(buyTxs.shift().quantity).times(buyTx.split_multiplier)
            } else {
                sellQuantity = unallocatedQuantity.toNumber()
                buyTxs[0].quantity = BigNumber(buyTxs[0].quantity).times(buyTx.split_multiplier).minus(sellQuantity).toNumber()
            }
            await client`
                INSERT INTO sells (transaction_id, sell_id, quantity, sell_price, exchange_rate)
                VALUES (${buyTx.id}, ${sellTx.id}, ${sellQuantity}, ${sellTx.initial_price}, ${sellTx.exchange_rate});`

            unallocatedQuantity = unallocatedQuantity.minus(sellQuantity)
        }
    }
    console.log('there')

    await client`
        WITH sells_total AS (
            SELECT SUM(s.quantity) as quantity,
                   t.id
            FROM transactions AS t
                LEFT JOIN sells AS s ON t.id = s.transaction_id
            WHERE t.holding_id = ${eventBody.holdingId}
            GROUP BY t.id
        ) 
        UPDATE transactions
        SET sell_quantity = sells_total.quantity
        FROM sells_total 
        WHERE transactions.id = sells_total.id`

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
})

export { handler }
