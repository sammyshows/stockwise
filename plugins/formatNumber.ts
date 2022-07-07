export default defineNuxtPlugin(() => {
    return {
        provide: {
            formatNumber: (numberString: string, precision: number) => {
                if (parseFloat(numberString))
                    return parseFloat(numberString).toLocaleString(
                        undefined,
                        { minimumFractionDigits: precision, maximumFractionDigits: precision })
                else
                    return null
            }
        }
    }
})