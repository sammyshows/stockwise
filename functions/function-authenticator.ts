import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
const client = require("../database/client.ts")

// This function authenticator function is used for, as you can guess, authorising function calls! This is my preferred
// way to authenticate function calls when you don't have an auth0 access token available. At the time of writing, the
// use case is CRON jobs that need to update asset prices every minute, so the job curls to the API but doesn't have an
// access token. It can, however, pass credentials for getting a token via auth0 M2M validation, so we can still do
// this is in a safe way.

// <===== NOTE =====>
// Calling the auth0 management for access tokens is a good approach but there's a limit to how many you can get per
// month. On the current plan that's 1000 tokens, which won't last a day... So for now the function for updating stock
// prices will be exposed so it can be called externally in the CRON job but this os not ideal long-term.
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
            authorization: auth["access_token"]
        },
        method: 'POST'
    })

    return {
        statusCode: 200
    }
}

export { handler }
