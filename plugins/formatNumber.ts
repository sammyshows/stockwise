export default defineNuxtPlugin(() => {
    return {
        provide: {
            formatNumber: (numberString: string, precision: number) => {
                return parseFloat(numberString).toLocaleString(
                    undefined,
                    { minimumFractionDigits: precision, maximumFractionDigits: precision })
            }
        }
    }
})