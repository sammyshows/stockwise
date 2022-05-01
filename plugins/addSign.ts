export default defineNuxtPlugin(() => {
    return {
        provide: {
            addSign: (numberString) => {
                if (numberString.replace(/,/g, '') > 0)
                    return '+' + numberString
                else
                    return numberString
            }
        }
    }
})