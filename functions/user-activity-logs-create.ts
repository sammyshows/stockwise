import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)
    console.log('got to the endpoint')
    await client`
        INSERT INTO user_activity_logs (user_id, source, tag, platform, message, study_id, portfolio_id, asset_id, holding_id, transaction_id) 
        VALUES (${eventBody.userId}, 
                ${eventBody.source}, 
                ${eventBody.tag},
                ${eventBody.platform},
                ${eventBody.message}, 
                ${eventBody.studyId}, 
                ${eventBody.portfolioId}, 
                ${eventBody.assetId}, 
                ${eventBody.holdingId}, 
                ${eventBody.transactionId})`

    return {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        statusCode: 200
    }
}

export { handler }