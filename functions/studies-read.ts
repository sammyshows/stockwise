import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async () => {
    const studies = await client`
        SELECT a.name,
               a.symbol,
               studies.id,
               type,
               completed_qs
        FROM studies
        INNER JOIN assets AS a ON a.id = studies.asset_id
        ORDER BY studies.updated_at DESC;
    `

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: studies
        })
    }
}

export { handler }
