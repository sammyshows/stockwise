import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const studies = await client`
        SELECT id AS study_id,
               name,
               symbol,
               type,
               notes,
               completed_qs,
               TO_CHAR(studies.updated_at, 'MM/DD/YYYY') AS updated_date,
               question_one,
               question_two,
               question_three,
               question_four,
               question_five,
               question_six,
               question_seven,
               question_eight,
               question_nine
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
})

export { handler }
