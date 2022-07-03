import { Handler } from "@netlify/functions";
import {consoleLog} from "vite-plugin-checker/lib/logger";
import BigNumber from "bignumber.js";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');


const handler: Handler = requireAuth(async (event, context) => {
    // Get data on every holding
    const holdingTotals = await client`
        SELECT users.id as user_id,
               portfolios.id as portfolio_id,
               holdings.id as holding_id,
               initial_value,
               current_price*share_count as current_value,
               current_price*share_count - initial_value + COALESCE(realized, 0) as all_time_change,
               (current_price*share_count + COALESCE(realized, 0) - initial_value) / COALESCE(all_time_initial, initial_value) * 100 as all_time_percent,
               SUBSTRING((CURRENT_DATE - 1)::TEXT, 1 ,10) as date
        FROM portfolios
             INNER JOIN users ON users.id = portfolios.user_id
             LEFT JOIN holdings ON portfolios.id = holdings.portfolio_id
             LEFT JOIN assets ON holdings.asset_id = assets.id;
    `

    // sort data into categorised arrays (unnested into rows for postgres)
    const holdingIds = holdingTotals.map(holding => holding["holding_id"])
    const holdingInitials = holdingTotals.map(holding => holding["initial_value"])
    const holdingCurrents = holdingTotals.map(holding => holding["current_value"])
    const holdingAllTimes = holdingTotals.map(holding => holding["all_time_change"])
    const holdingAllTimePcs = holdingTotals.map(holding => holding["all_time_percent"])
    const holdingDates = holdingTotals.map(holding => holding["date"])
    await client`
        WITH holding (holding_id, initial_value, current_value, all_time_change, all_time_percent, date) AS (
            SELECT *
            FROM
                UNNEST(
                        ${holdingIds}::UUID[],
                        ${holdingInitials}::NUMERIC[],
                        ${holdingCurrents}::NUMERIC[],
                        ${holdingAllTimes}::NUMERIC[],
                        ${holdingAllTimePcs}::NUMERIC[],
                        ${holdingDates}::DATE[]
                    )
        )
        INSERT INTO partman.holding_data (holding_id, initial_value, current_value, all_time_change, all_time_percent, date)
        SELECT holding_id, initial_value, current_value, all_time_change, all_time_percent, date
        FROM holding;`

    // reduce the holding data into portfolio data
    let portfolioTotals = holdingTotals.reduce((portfolioTotal, { user_id, portfolio_id, initial_value, current_value, all_time_change, all_time_percent, date }) => {
        portfolioTotal[portfolio_id] = portfolioTotal[portfolio_id] || {user_id: user_id, portfolio_id: portfolio_id, initial_value: 0, current_value: 0, all_time_change: 0, all_time_percent: 0, date: date}
        portfolioTotal[portfolio_id].initial_value = new BigNumber(portfolioTotal[portfolio_id].initial_value).plus(initial_value).toNumber()
        portfolioTotal[portfolio_id].current_value = new BigNumber(portfolioTotal[portfolio_id].current_value).plus(current_value).toNumber()
        portfolioTotal[portfolio_id].all_time_change = new BigNumber(portfolioTotal[portfolio_id].all_time_change).plus(all_time_change).toNumber()
        portfolioTotal[portfolio_id].all_time_percent = new BigNumber(portfolioTotal[portfolio_id].all_time_percent).plus(all_time_percent).toNumber()
        return portfolioTotal
    }, {})
    portfolioTotals = Object.values(portfolioTotals)

    const portfolioIds = portfolioTotals.map(portfolio => portfolio["portfolio_id"])
    const portfolioInitials = portfolioTotals.map(portfolio => portfolio["initial_value"])
    const portfolioCurrents = portfolioTotals.map(portfolio => portfolio["current_value"])
    const portfolioAllTimes = portfolioTotals.map(portfolio => portfolio["all_time_change"])
    const portfolioAllTimePcs = portfolioTotals.map(portfolio => portfolio["all_time_percent"])
    const portfolioDates = portfolioTotals.map(portfolio => portfolio["date"])
    await client`
        WITH portfolio (portfolio_id, initial_value, current_value, all_time_change, all_time_percent, date) AS (
            SELECT *
            FROM
                UNNEST(
                        ${portfolioIds}::UUID[],
                        ${portfolioInitials}::NUMERIC[],
                        ${portfolioCurrents}::NUMERIC[],
                        ${portfolioAllTimes}::NUMERIC[],
                        ${portfolioAllTimePcs}::NUMERIC[],
                        ${portfolioDates}::DATE[]
                )
        )
        INSERT INTO partman.portfolio_data (portfolio_id, initial_value, current_value, all_time_change, all_time_percent, date)
        SELECT portfolio_id, initial_value, current_value, all_time_change, all_time_percent, date
        FROM portfolio;`


    let userTotals = portfolioTotals.reduce((userTotal, { user_id, initial_value, current_value, all_time_change, all_time_percent, date }) => {
        userTotal[user_id] = userTotal[user_id] || {user_id: user_id, initial_value: 0, current_value: 0, date: date}
        userTotal[user_id].initial_value = new BigNumber(userTotal[user_id].initial_value).plus(initial_value).toNumber()
        userTotal[user_id].current_value = new BigNumber(userTotal[user_id].current_value).plus(current_value).toNumber()
        userTotal[user_id].all_time_change = new BigNumber(userTotal[user_id].all_time_change).plus(all_time_change).toNumber()
        userTotal[user_id].all_time_percent = new BigNumber(userTotal[user_id].all_time_percent).plus(all_time_percent).toNumber()
        return userTotal
    }, {})
    userTotals = Object.values(userTotals)

    const userIds = userTotals.map(user => user["user_id"])
    const userInitials = userTotals.map(user => user["initial_value"])
    const userCurrents = userTotals.map(user => user["current_value"])
    const userAllTimes = userTotals.map(user => user["all_time_change"])
    const userAllTimePcs = userTotals.map(user => user["all_time_percent"])
    const userDates = userTotals.map(user => user["date"])
    await client`
        WITH user_data (user_id, initial_value, current_value, all_time_change, all_time_percent, date) AS (
            SELECT *
            FROM
                UNNEST(
                        ${userIds}::UUID[],
                        ${userInitials}::NUMERIC[],
                        ${userCurrents}::NUMERIC[],
                        ${userAllTimes}::NUMERIC[],
                        ${userAllTimePcs}::NUMERIC[],
                        ${userDates}::DATE[]
                )
        )
        INSERT INTO partman.user_portfolios_data (user_id, initial_value, current_value, all_time_change, all_time_percent, date)
        SELECT user_id, initial_value, current_value, all_time_change, all_time_percent, date
        FROM user_data;`



    await client`CALL partman.run_maintenance_proc();`

    return {
        statusCode: 200
    }
})

export { handler }
