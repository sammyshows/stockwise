import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const study = await client`
        SELECT s.name,
               s.symbol,
               type,
               completed_qs,
               notes,
               TO_CHAR(s.updated_at, 'MM/DD/YYYY') AS updated_date,
               question_one,
               question_two,
               question_three,
               question_four,
               question_five,
               question_six,
               question_seven,
               question_eight,
               question_nine
        FROM studies AS s
        WHERE s.id = ${eventBody.studyId}
        ORDER BY s.updated_at DESC;
    `

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: study[0]
        })
    }
})

export { handler }
