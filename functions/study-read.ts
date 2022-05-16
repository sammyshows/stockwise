import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async () => {
    const study = await client`
        SELECT a.name,
               a.symbol,
               studies.id,
               type,
               completed,
               question_one,
               question_two,
               question_three,
               question_four,
               question_five,
               question_six,
               question_seven,
               question_eight
        FROM studies
        INNER JOIN assets AS a ON a.id = studies.asset_id
        ORDER BY studies.updated_at DESC;
    `

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: study[0]
        })
    }
}

export { handler }
