import { Handler } from "@netlify/functions";
const client = require("../database/client.ts")
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    // This names object is used to add names to assets since IEX Cloud doesn't return a name with the price
    const names = {
        AUD: "Australian Dollar",
        CAD: "Canadian Dollar",
        CHF: "Swiss Franc",
        CNH: "Chinese Yuan Renminbi (HK)",
        CZK: "Czech Koruna",
        DKK: "Danish Krone",
        EUR: "Euro",
        GBP: "British Pound",
        HKD: "Hong Kong Dollar",
        HUF: "Hungarian Forint",
        ILS: "Israeli New Shekel",
        INR: "Indian Rupee",
        JPY: "Japanese Yen",
        MXN: "Mexican Peso",
        NOK: "Norwegian Krone",
        NZD: "New Zealand Dollar",
        PLN: "Polish Zloty",
        RON: "Romanian Leu",
        RUB: "Russian Ruble",
        SEK: "Swedish Krona",
        SGD: "Singapore Dollar",
        THB: "Thai Baht",
        TRY: "Turkish Lira",
        USD: "U.S. Dollar",
        ZAR: "South African Rand"
    }
    const symbol = eventBody.from + eventBody.to

    // This is temporary until I figure out how to set prev_close prices for forex assets. Possibly when I use CRON jobs
    const prevClose = await fetch(`https://cloud.iexapis.com/stable/fx/historical?symbols=${symbol}&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())
        .then(data => data[0][0].rate)

    const currentPrice = await fetch(`${process.env.DOMAIN}/api/iex-quote-forex`, {
        headers: {
            authorization: 'Bearer ' + eventBody.token
        },
        method: 'POST',
        body: JSON.stringify({
            symbol: symbol
        })
    })
        .then(response => response.json())
        .then(asset => asset["rate"])

    const createdAsset = await client`
        INSERT INTO assets (symbol, current_price, prev_close, name, type)
        VALUES (${symbol},
                ${currentPrice},
                ${prevClose},
                ${names[eventBody.from] + " to " + names[eventBody.to]},
                1)
        ON CONFLICT (symbol) 
            DO UPDATE SET current_price = ${currentPrice}
        RETURNING id;`

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: createdAsset[0]
        })
    }
})

export { handler }
