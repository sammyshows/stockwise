export default defineNuxtPlugin(() => {
    return {
        provide: {
            fontSize: (string, defaultSize, initialThreshold?) => {
                if (defaultSize === 'text-xs') {
                    if (string.length <= (initialThreshold || 10))
                        return defaultSize
                    else if (string.length < (initialThreshold + 3 || 13))
                        return 'text-tiny'
                    else if (string.length < (initialThreshold + 3 || 16))
                        return 'text-teeny'
                    else
                        return 'text-atomic'
                }

                if (defaultSize === 'text-tiny') {
                    if (string.length <= (initialThreshold || 13))
                        return defaultSize
                    if (string.length <= (initialThreshold + 3 || 16))
                        return 'text-teeny'
                    else
                        return 'text-atomic'
                }
            }
        }
    }
})