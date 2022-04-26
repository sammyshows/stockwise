export default defineNuxtPlugin(() => {
    return {
        provide: {
            addSign: (numberString) => {
                if (numberString > 0)
                    return '+' + numberString
                else if (numberString < 0)
                    return numberString
            }
        }
    }
})