import { Handler } from "@netlify/functions";
const { requireAuth } = require('../api/auth');
import fetch from 'node-fetch'

const handler: Handler = requireAuth(async (event, context) => {
    const eventBody = JSON.parse(event.body)

    let prevClose
    let currentPrice
    const symbol = eventBody.from + eventBody.to
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

    // This is temporary until I figure out how to set prev_close prices for forex assets. Possibly when I use CRON jobs
    const getPrevClose = fetch(`https://cloud.iexapis.com/stable/fx/historical?symbols=${symbol}&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())
        .then(data => data[0][0].rate)

    const getCurrentPrice = fetch(`https://cloud.iexapis.com/stable/fx/latest?symbols=${symbol}&token=${process.env.IEXTOKEN}`)
        .then(response => response.json())
        .then(data => data[0].rate)

    await Promise.all([getPrevClose, getCurrentPrice])
        .then(result => {
            prevClose = result[0]
            currentPrice = result[1]
        })

    return {
        statusCode: 200,
        body: JSON.stringify({
            prevClose: prevClose,
            currentPrice: currentPrice,
            name: names[eventBody.from] + " to " + names[eventBody.to]
        })
    }
})

export { handler }
