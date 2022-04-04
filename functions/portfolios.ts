import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    return await client`
        SELECT * FROM portfolios;`
        .then(response => {

            return {
                statusCode: 200,
                body: JSON.stringify({
                    data: response
                })
            }
        })
        .catch(error => {
            console.error(error)

            return {
                statusCode: 400
            }
        })
}

export { handler }
