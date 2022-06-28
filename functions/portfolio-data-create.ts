import { Handler } from "@netlify/functions";
import {consoleLog} from "vite-plugin-checker/lib/logger";
import BigNumber from "bignumber.js";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');


const handler: Handler = requireAuth(async (event, context) => {
    const portfolioTotals = await client`
        SELECT users.id as user_id,
               portfolios.id as portfolio_id,
               SUM(initial_value) as initial_value,
               SUM(current_price*share_count) as current_value,
               SUBSTRING((CURRENT_DATE - 1)::TEXT, 1 ,10) as date
        FROM portfolios
             INNER JOIN users ON users.id = portfolios.user_id
             LEFT JOIN holdings ON portfolios.id = holdings.portfolio_id
             LEFT JOIN assets ON holdings.asset_id = assets.id
        GROUP BY portfolios.id, users.id
    `

    const portfolioIds = portfolioTotals.map(portfolio => portfolio["portfolio_id"])
    const portfolioInitials = portfolioTotals.map(portfolio => portfolio["initial_value"])
    const portfolioCurrents = portfolioTotals.map(portfolio => portfolio["current_value"])
    const portfolioDates = portfolioTotals.map(portfolio => portfolio["date"])
    await client`
        WITH portfolio (portfolio_id, initial_value, current_value, date) AS (
            SELECT *
            FROM
                UNNEST(
                        ${portfolioIds}::UUID[],
                        ${portfolioInitials}::NUMERIC[],
                        ${portfolioCurrents}::NUMERIC[],
                        ${portfolioDates}::DATE[]
                )
        )
        INSERT INTO partman.portfolio_data (portfolio_id, initial_value, current_value, date)
        SELECT portfolio_id, initial_value, current_value, date
        FROM portfolio;`


    let userTotals = portfolioTotals.reduce((userTotal, { user_id, initial_value, current_value, date }) => {
        userTotal[user_id] = userTotal[user_id] || {user_id: user_id, initial_value: 0, current_value: 0, date: date}
        if (initial_value) { // Essentially if there's no holdings, don't add null to a number :)
            userTotal[user_id].initial_value = new BigNumber(userTotal[user_id].initial_value).plus(initial_value).toNumber()
            userTotal[user_id].current_value = new BigNumber(userTotal[user_id].current_value).plus(current_value).toNumber()
        }
        return userTotal
    }, {})
    userTotals = Object.values(userTotals)
    console.log(userTotals)

    const userIds = userTotals.map(user => user["user_id"])
    const userInitials = userTotals.map(user => user["initial_value"])
    const userCurrents = userTotals.map(user => user["current_value"])
    const userDates = userTotals.map(user => user["date"])
    await client`
        WITH user_data (user_id, initial_value, current_value, date) AS (
            SELECT *
            FROM
                UNNEST(
                        ${userIds}::UUID[],
                        ${userInitials}::NUMERIC[],
                        ${userCurrents}::NUMERIC[],
                        ${userDates}::DATE[]
                )
        )
        INSERT INTO partman.user_portfolios_data (user_id, initial_value, current_value, date)
        SELECT user_id, initial_value, current_value, date
        FROM user_data;`



    await client`CALL partman.run_maintenance_proc();`

    return {
        statusCode: 200
    }
})

export { handler }
