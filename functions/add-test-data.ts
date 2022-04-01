import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")

client.connect();

const handler: Handler = async (event, context) => {
    return await client
        .query('SELECT table_schema,table_name FROM information_schema.tables;')
        .then(response => {
            for (let row of response.rows) {
                console.log(JSON.stringify(row))
            }
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
