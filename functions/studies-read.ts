import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const studies = await client`
        SELECT name,
               symbol,
               studies.id,
               type,
               completed_qs,
               TO_CHAR(studies.updated_at, 'MM/DD/YYYY') AS updated_date
        FROM studies
        WHERE user_id = ${eventBody.uuid}
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
