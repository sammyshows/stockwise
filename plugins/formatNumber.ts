import { useUser } from "@/store/user.js";

// symbols that go before the number
const beforeSymbols = {
    AUD: "A$",
    CAD: "CA$",
    CHF: "fr. ",
    CNH: "¥ ",
    DKK: "kr.",
    EUR: "€",
    GBP: "£",
    HKD: "HK$ ",
    ILS: "₪ ",
    INR: "₹ ",
    JPY: "¥ ",
    MXN: "$ ",
    NOK: "kr ",
    NZD: "$ ",
    SGD: "S$",
    USD: "$",
    ZAR: "R "
}

// symbols that go after the number
const afterSymbols = {
    CZK: " Kč",
    HUF: " Ft",
    PLN: " zł",
    RON: " lei",
    RUB: " p.",
    SEK: " kr",
    THB: " ฿",
    TRY: " ₺",
}

export default defineNuxtPlugin(() => {
    return {
        provide: {
            formatNumber: (numberString: string, precision: number, addCurrency: boolean, addSign: boolean ) => {
                let numStr = null as (string | null)

                // round and format to local format e.g. 1000.2312 = 1000.23 || 1000,23
                if (parseFloat(numberString)) {
                    numStr = parseFloat(numberString).toLocaleString(
                        undefined,
                        {minimumFractionDigits: precision, maximumFractionDigits: precision})
                } else {
                    return null
                }

                // add symbol to string e.g. 10,000.34 = A$10,000.34 || 10,000.34 Ft
                if (addCurrency) {
                    const symbol = useUser().currency
                    if (Object.keys(beforeSymbols).includes(symbol))
                        numStr = beforeSymbols[symbol] + numStr

                    if (Object.keys(afterSymbols).includes(symbol))
                        numStr = numStr + afterSymbols[symbol]
                }

                // Add '+' sign to string if number is positive (negative numbers already have '-' of course)
                if (addSign) {
                    if (parseFloat(numberString) > 0)
                        numStr = '+' + numStr
                }

                return numStr
            }
        }
    }
})