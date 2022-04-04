import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")


const handler: Handler = async (event, context) => {
    return await client`
        SELECT table_schema,table_name FROM information_schema.tables;`
        .then(response => {
            response.forEach(row => {
                console.log(JSON.stringify(row))
            })
            client.end()

            return {
                statusCode: 200,
                body: JSON.stringify({
                    data: 'data'
                })
            }
        })
        .catch(error => {
            console.error(error.stack)
            client.end()

            return {
                statusCode: 400
            }
        })
}

export { handler }
