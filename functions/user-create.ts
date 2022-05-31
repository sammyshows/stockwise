import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    await client`
        INSERT INTO users (id, email)
        VALUES (${eventBody.uuid}, ${eventBody.email})`

    return {
        statusCode: 200
    }
}

export { handler }
