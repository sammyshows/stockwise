export default defineNuxtPlugin(() => {
    return {
        provide: {
            addSign: (number) => {
                if (number > 0)
                    return '+' + number
                else if (number < 0)
                    return number
            }
        }
    }
})