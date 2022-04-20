import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)
    const asset = await client`SELECT * FROM assets INNER JOIN holdings ON assets.id = holdings.asset_id WHERE holdings.id = ${eventBody.holdingId};`

    return {
        statusCode: 200,
        body: JSON.stringify({
            asset: asset
        })
    }
}

export { handler }
