import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        UPDATE studies
        SET notes = ${eventBody.notes || null},
            question_one = ${eventBody.question_one},
            question_two = ${eventBody.question_two},
            question_three = ${eventBody.question_three},
            question_four = ${eventBody.question_four},
            question_five = ${eventBody.question_five},
            question_six = ${eventBody.question_six},
            question_seven = ${eventBody.question_seven},
            question_eight = ${eventBody.question_eight},
            question_nine = ${eventBody.question_nine}
        WHERE studies.id = ${eventBody.studyId};`

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
})

export { handler }
