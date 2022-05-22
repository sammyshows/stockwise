import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const study = await client`
        SELECT a.name,
               a.symbol,
               type,
               completed_qs,
               TO_CHAR(studies.updated_at, 'MM/DD/YYYY') AS updated_date,
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
        WHERE studies.id = ${eventBody.studyId}
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
