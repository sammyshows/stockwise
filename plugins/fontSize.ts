export default defineNuxtPlugin(() => {
    return {
        provide: {
            fontSize: (string, defaultSize) => {
                console.log(string)
                if (defaultSize === 'text-xs') {
                    if (string.length <= 12)
                        return defaultSize
                    else if (string.length < 16)
                        return 'text-tiny'
                }
            }
        }
    }
})