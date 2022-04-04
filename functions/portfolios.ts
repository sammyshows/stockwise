import { Handler } from "@netlify/functions";
import client from "../database/client"


const handler: Handler = async (event, context) => {
    return await client`
        SELECT table_schema,table_name FROM information_schema.tables;`
        .then(response => {
            response.forEach(row => {
                console.log(JSON.stringify(row))
            })

            return {
                statusCode: 200,
                body: JSON.stringify({
                    data: 'data'
                })
            }
        })
        .catch(error => {
            console.error(error.stack)

            return {
                statusCode: 400
            }
        })
}

export { handler }
