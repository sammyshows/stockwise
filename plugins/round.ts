export default defineNuxtPlugin(() => {
    return {
        provide: {
            round: (numberString: string, precision: number) => {
                const number = parseFloat(numberString)
                return number.toFixed(precision)
            }
        }
    }
})