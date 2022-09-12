import { useUser } from "@/store/user.js";

// symbols that go before the number
const beforeSymbols = {
    AUD: "A$",
    CAD: "CA$",
    CHF: "₣ ",
    DKK: "kr.",
    GBP: "£",
    HKD: "HK$",
    ILS: "₪ ",
    INR: "₹ ",
    JPY: "¥ ",
    MXN: "MX$",
    NOK: "kr ",
    NZD: "NZ$",
    SGD: "S$",
    USD: "$",
    ZAR: "R "
}

// symbols that go after the number
const afterSymbols = {
    CNH: " 元",
    CZK: " Kč",
    EUR: "€",
    HUF: " Ft",
    PLN: " zł",
    RON: " lei",
    RUB: " ₽",
    SEK: " kr",
    THB: " ฿",
    TRY: " ₺",
}

export default defineNuxtPlugin(() => {
    return {
        provide: {
            formatNumber: (numberString: string, precision: number, addCurrency: boolean, addSign: boolean, currencySymbol?: string ) => {
                let numStr = null as (string | null)
                const makeNegative = parseFloat(numberString) < 0 && parseFloat(numberString) < -0.0000000001

                // round and format to local format e.g. 1000.2312 = 1000.23 || 1000,23
                if (parseFloat(numberString) || parseFloat(numberString) == 0) {
                    numStr = Math.abs(parseFloat(numberString)).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2, maximumFractionDigits: precision })
                } else {
                    return null
                }

                // add symbol to string e.g. 10,000.34 = A$10,000.34 || 10,000.34 Ft
                if (addCurrency) {
                    const symbol = currencySymbol || useUser().currency
                    if (Object.keys(beforeSymbols).includes(symbol))
                        numStr = beforeSymbols[symbol] + numStr

                    if (Object.keys(afterSymbols).includes(symbol))
                        numStr = numStr + afterSymbols[symbol]
                }

                // in step one we convert numbers to positive for the sake of adding currency symbols, now is the time
                // to add back the '-' symbol if the number was indeed negative
                if (makeNegative)
                    numStr = '-' + numStr

                // Add '+' sign to string if number is positive
                if (addSign) {
                    if (parseFloat(numberString) > 0)
                        numStr = '+' + numStr
                }

                return numStr
            }
        }
    }
})