import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const newTx = await client`
        INSERT INTO transactions (holding_id, type, quantity, initial_price, exchange_rate, timestamp) 
        VALUES (${eventBody.holdingId}, ${eventBody.type}, ${eventBody.type === 1 ? eventBody.quantity * -1 : eventBody.quantity}, ${eventBody.initialPrice}, ${eventBody.exchangeRate || null}, ${eventBody.timestamp})
        RETURNING id;`

    // If it's a SELL (type === 1) and the selling method is FIFO (sellMethod === 0).
    if (eventBody.type === 1 && eventBody.sellMethod === 0) {
        // Get all tx available share quantities for this holding.
        const txs = await client`
            SELECT t.id,
                   COALESCE(t.quantity - SUM(s.quantity), t.quantity) AS quantity
            FROM transactions AS t
                LEFT JOIN sells AS s ON t.id = s.transaction_id
            WHERE t.type = 0 AND t.holding_id = ${eventBody.holdingId}
            GROUP BY t.id
            ORDER BY t.timestamp ASC;`

        // Go through the txs and sell the as many shares as necessary until the total sell quantity has been met.
        let index = 0
        let unallocatedQuantity = eventBody.quantity
        while (unallocatedQuantity > 0) {
            let sellQuantity = unallocatedQuantity

            // If this tx has less shares than are required to sell, be sure to sell all you can of this tx anyway.
            if (txs[index].quantity < unallocatedQuantity)
                sellQuantity = txs[index].quantity
            console.log('here')

            await client`
                INSERT INTO sells (transaction_id, sell_id, quantity, sell_price, exchange_rate)
                VALUES (${txs[index].id}, ${newTx[0].id}, ${sellQuantity}, ${eventBody.initialPrice}, ${eventBody.exchangeRate || null});`

            unallocatedQuantity -= sellQuantity
            index += 1
        }
    }

    return {
        statusCode: 200
    }
})

export { handler }
