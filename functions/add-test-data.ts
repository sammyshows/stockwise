import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
// const client = require("../database/client.ts")
//
// client.connect();
//
// const handler: Handler = async (event, context) => {
//     return await client
//         .query('SELECT table_schema,table_name FROM information_schema.tables;')
//         .then(response => {
//             for (let row of response.rows) {
//                 console.log(JSON.stringify(row))
//             }
//             client.end()
//
//             return {
//                 statusCode: 200,
//                 body: JSON.stringify({
//                     data: 'data'
//                 })
//             }
//         })
//         .catch(error => {
//             console.error(error.stack)
//             client.end()
//
//             return {
//                 statusCode: 400
//             }
//         })
// }

const handler: Handler = async () => {

    const data = await fetch(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=B642KXFN4VUO0FC2`)
        .then(response => response.json())
        .catch(error => console.error(error))

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: data
        })
    }
}

export { handler }
