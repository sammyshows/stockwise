import { Handler } from "@netlify/functions";
import {consoleLog} from "vite-plugin-checker/lib/logger";
import BigNumber from "bignumber.js";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');


const handler: Handler = requireAuth(async (event, context) => {
    // Get data on every holding
    const holdingTotals = await client`
        WITH cte AS (
            SELECT u.user_id AS user_id,
                   p.id AS portfolio_id,
                   h.id AS holding_id,
                   (t.quantity - COALESCE(SUM(s.quantity), 0)) * t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price) as initial_value,
                   a.current_price * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price AS current_value,
                   (a.current_price * (t.quantity - COALESCE(SUM(s.quantity), 0)) * asset_c.current_price * user_c.current_price) - (t.quantity - COALESCE(SUM(s.quantity), 0)) * t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price) + COALESCE(SUM(s.quantity * (s.sell_price * COALESCE(s.exchange_rate, asset_c.current_price * user_c.current_price) - t.initial_price * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price))), 0) as all_time_change,
                   t.initial_value * COALESCE(t.exchange_rate, asset_c.current_price * user_c.current_price) AS all_time_initial
            FROM holdings AS h
                INNER JOIN portfolios AS p ON h.portfolio_id = p.id
                INNER JOIN assets AS a ON h.asset_id = a.id
                INNER JOIN user_settings AS u ON p.user_id = u.user_id
                INNER JOIN assets AS asset_c ON a.currency_id = asset_c.id
                INNER JOIN assets AS user_c ON u.currency_id = user_c.id
                INNER JOIN transactions AS t ON h.id = t.holding_id
                LEFT JOIN sells AS s ON t.id = s.transaction_id
            WHERE t.type = 0
            GROUP BY u.id, h.id, a.id, p.id, asset_c.id, user_c.id, t.id
        )
        SELECT cte.user_id,
               cte.holding_id,
               cte.portfolio_id,
               SUM(cte.initial_value) AS initial_value,
               SUM(cte.current_value) AS current_value,
               SUM(cte.all_time_change) AS all_time_change,
               SUM(cte.all_time_initial) AS all_time_initial,
               SUBSTRING((CURRENT_DATE - 1)::TEXT, 1 ,10) AS date
        FROM cte
        GROUP BY cte.user_id, cte.holding_id, cte.portfolio_id`

    // sort data into categorised arrays (unnested into rows for postgres)
    const holdingIds = holdingTotals.map(holding => holding["holding_id"])
    const holdingInitials = holdingTotals.map(holding => holding["initial_value"])
    const holdingCurrents = holdingTotals.map(holding => holding["current_value"])
    const holdingAllTimes = holdingTotals.map(holding => holding["all_time_change"])
    const holdingAllTimePcs = holdingTotals.map(holding => holding["all_time_change"] / holding["all_time_initial"])
    const holdingDates = holdingTotals.map(holding => holding["date"])
    console.log(holdingCurrents)
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
    let portfolioTotals = holdingTotals.reduce((portfolioTotal, { user_id, portfolio_id, initial_value, current_value, all_time_change, all_time_initial, date }) => {
        portfolioTotal[portfolio_id] = portfolioTotal[portfolio_id] || {user_id: user_id, portfolio_id: portfolio_id, initial_value: 0, current_value: 0, all_time_change: 0, all_time_initial: 0, date: date}
        portfolioTotal[portfolio_id].initial_value = new BigNumber(portfolioTotal[portfolio_id].initial_value).plus(initial_value).toNumber()
        portfolioTotal[portfolio_id].current_value = new BigNumber(portfolioTotal[portfolio_id].current_value).plus(current_value).toNumber()
        portfolioTotal[portfolio_id].all_time_change = new BigNumber(portfolioTotal[portfolio_id].all_time_change).plus(all_time_change).toNumber()
        portfolioTotal[portfolio_id].all_time_initial = new BigNumber(portfolioTotal[portfolio_id].all_time_initial).plus(all_time_initial).toNumber()
        return portfolioTotal
    }, {})
    portfolioTotals = Object.values(portfolioTotals)

    const portfolioIds = portfolioTotals.map(portfolio => portfolio["portfolio_id"])
    const portfolioInitials = portfolioTotals.map(portfolio => portfolio["initial_value"])
    const portfolioCurrents = portfolioTotals.map(portfolio => portfolio["current_value"])
    const portfolioAllTimes = portfolioTotals.map(portfolio => portfolio["all_time_change"])
    const portfolioAllTimePcs = portfolioTotals.map(portfolio => portfolio["all_time_change"] / portfolio["all_time_initial"])
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


    let userTotals = portfolioTotals.reduce((userTotal, { user_id, initial_value, current_value, all_time_change, all_time_initial, date }) => {
        userTotal[user_id] = userTotal[user_id] || {user_id: user_id, initial_value: 0, current_value: 0, all_time_change: 0, all_time_initial: 0, date: date}
        userTotal[user_id].initial_value = new BigNumber(userTotal[user_id].initial_value).plus(initial_value).toNumber()
        userTotal[user_id].current_value = new BigNumber(userTotal[user_id].current_value).plus(current_value).toNumber()
        userTotal[user_id].all_time_change = new BigNumber(userTotal[user_id].all_time_change).plus(all_time_change).toNumber()
        userTotal[user_id].all_time_initial = new BigNumber(userTotal[user_id].all_time_initial).plus(all_time_initial).toNumber()
        return userTotal
    }, {})
    userTotals = Object.values(userTotals)

    const userIds = userTotals.map(user => user["user_id"])
    const userInitials = userTotals.map(user => user["initial_value"])
    const userCurrents = userTotals.map(user => user["current_value"])
    const userAllTimes = userTotals.map(user => user["all_time_change"])
    const userAllTimePcs = userTotals.map(user => user["all_time_change"] / user["all_time_initial"])
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
