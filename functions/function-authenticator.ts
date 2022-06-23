import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    const auth = await fetch('https://stockwise.us.auth0.com/oauth/token', {
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: eventBody.clientId,
            client_secret: eventBody.clientSecret,
            audience: eventBody.audience
        })
    })
        .then(response => response.json())

    await fetch(eventBody.url, {
        headers: {
            authorization: 'Bearer ' + auth["access_token"]
        },
        method: 'POST'
    })

    return {
        statusCode: 200
    }
}

export { handler }
