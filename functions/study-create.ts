import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const study = await client`
        INSERT INTO studies (user_id, asset_id, type) 
        VALUES (${eventBody.userId}, ${eventBody.assetId}, ${eventBody.type})
        RETURNING id;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            studyId: study[0].id
        })
    }
}

export { handler }
