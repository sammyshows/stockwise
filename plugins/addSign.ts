export default defineNuxtPlugin(() => {
    return {
        provide: {
            addSign: (numberString) => {
                if (!numberString)
                    return numberString
                else if (numberString.replace(/,/g, '') > 0)
                    return '+' + numberString
                else
                    return numberString
            }
        }
    }
})