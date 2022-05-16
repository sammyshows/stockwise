import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async () => {
    const studies = await client`
        SELECT a.name,
               a.symbol,
               studies.id,
               type,
               completed,
               CASE WHEN question_one IS NOT NULL THEN 1 ELSE 0 END + 
               CASE WHEN question_two IS NOT NULL THEN 1 ELSE 0 END + 
               CASE WHEN question_three IS NOT NULL THEN 1 ELSE 0 END + 
               CASE WHEN question_four IS NOT NULL THEN 1 ELSE 0 END + 
               CASE WHEN question_five IS NOT NULL THEN 1 ELSE 0 END + 
               CASE WHEN question_six IS NOT NULL THEN 1 ELSE 0 END + 
               CASE WHEN question_seven IS NOT NULL THEN 1 ELSE 0 END + 
               CASE WHEN question_eight IS NOT NULL THEN 1 ELSE 0 END AS completed_qs
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
