import { Handler } from "@netlify/functions";
import {consoleLog} from "vite-plugin-checker/lib/logger";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');


const handler: Handler = requireAuth(async (event, context) => {
    const portfolio_totals = await client`
        SELECT portfolios.id,
               SUM(initial_value) as initial_value,
               SUM(current_price*share_count) as current_value,
               SUBSTRING((CURRENT_DATE - 1)::TEXT, 1 ,10) as date
        FROM portfolios
             LEFT JOIN holdings ON portfolios.id = holdings.portfolio_id
             LEFT JOIN assets ON holdings.asset_id = assets.id
        GROUP BY portfolios.id
    `

    console.log(portfolio_totals)
    const portfolioIds = Object.values(portfolio_totals).map(portfolio => portfolio["id"])
    const initialValues = Object.values(portfolio_totals).map(portfolio => portfolio["initial_value"])
    const currentValues = Object.values(portfolio_totals).map(portfolio => portfolio["current_value"])
    const dates = Object.values(portfolio_totals).map(portfolio => portfolio["date"])

    await client`
        WITH portfolio (portfolio_id, initial_value, current_value, date) AS (
            SELECT *
            FROM
                UNNEST(
                        ${portfolioIds}::UUID[],
                        ${initialValues}::NUMERIC[],
                        ${currentValues}::NUMERIC[],
                        ${dates}::DATE[]
                )
        )
        INSERT INTO partman.portfolio_data (portfolio_id, initial_value, current_value, date)
        SELECT portfolio_id, initial_value, current_value, date
        FROM portfolio; 
   `



    await client`CALL partman.run_maintenance_proc();`

    return {
        statusCode: 200
    }
})

export { handler }
