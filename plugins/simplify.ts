export default defineNuxtPlugin(() => {
    return {
        provide: {
            simplify: (numberString: string, precision: number) => {
                let num = null as (number | null)
                let letter = null as (string | null)

                // round and format to local format e.g. 1000.2312 = 1000.23 || 1000,23
                if (parseFloat(numberString))
                    num = parseFloat(numberString)
                else
                    return null

                if (num > 1000) {
                    if (num < 1000000) {
                        letter = 'K'
                        num = num / 1000
                    } else if (num < 1000000000) {
                        letter = 'M'
                        num = num / 1000000
                    } else if (num < 1000000000000) {
                        letter = 'B'
                        num = num / 1000000000
                    } else if (num < 1000000000000000) {
                        letter = 'T'
                        num = num / 1000000000000
                    }
                }

                return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: precision }) + letter
            }
        }
    }
})