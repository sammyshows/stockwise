export default defineNuxtPlugin(() => {
    return {
        provide: {
            fontSize: (string, defaultSize, initialThreshold?) => {
                if (defaultSize === 'text-xs') {
                    if (string.length <= (initialThreshold || 10))
                        return defaultSize
                    else if (string.length < (initialThreshold + 3 || 13))
                        return 'text-tiny'
                    else
                        return 'text-atomic'
                }

                if (defaultSize === 'text-tiny') {
                    if (string.length <= (initialThreshold || 10))
                        return defaultSize
                    else
                        return 'text-atomic'
                }
            }
        }
    }
})