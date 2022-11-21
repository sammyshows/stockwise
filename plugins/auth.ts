import { useAuth } from "@/store/auth.js";
import { useUser } from "@/store/user.js";
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export default defineNuxtPlugin(() => {
    return {
        provide: {
            login: async (email?, password?): Promise<string> => {
                const config = useRuntimeConfig()
                let accessToken
                let refreshToken
                let idToken
                let key
                let message = "" // default return message

                if (useAuth().accessToken)
                    return

                const keyNames = await SecureStoragePlugin.keys()
                    .then(result => result.value)

                // key has to be defined for this particular capacitor plugin to work.
                key = 'accessToken'
                if (keyNames.includes(key))
                    accessToken = await SecureStoragePlugin.get({ key })
                        .then(result => result.value)

                key = 'refreshToken'
                if (keyNames.includes(key))
                    refreshToken = await SecureStoragePlugin.get({ key })
                        .then(result => result.value)

                key = 'idToken'
                if (keyNames.includes(key))
                    idToken = await SecureStoragePlugin.get({ key })
                        .then(result => result.value)

                const response = await fetch('https://www.stockwise.app/api/auth-login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: email || null,
                        password: password || null,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        idToken: idToken
                    })
                }).then(async (res) => {
                    const body = await res.json()

                    if (res.status === 200) {
                        message = "authorized"
                        return body
                    }

                    if (res.status === 300) {
                        if (body.errorMessage === "LoginRequired")
                            window.location.pathname = `/auth/login`

                        if (body.errorMessage === "NotAuthorizedException")
                            message = "notAuthorized"

                        return body
                    } else {
                        message = "error"
                    }

                    // Should it just return the body here once for all the above cases? Because currently if the else
                    // case is reached, no body is returned and the next check for an accessToken will give an error.
                })

                if (response.accessToken) {
                    useAuth().$patch({
                        accessToken: response.accessToken
                    })

                    if (window.location.hostname !== 'www.stockwise.app') {
                        const keys = ['accessToken', 'refreshToken', 'idToken']
                        keys.forEach((key) => {
                            const value = response[key]
                            SecureStoragePlugin.set({ key, value })
                        })
                    }
                }

                if (response.userId) {
                    useUser().$patch({
                        userId: response.userId
                    })
                }

                return message
            },

            logout: async (): Promise<void> => {
                const config = useRuntimeConfig()

                const response = await fetch('https://www.stockwise.app/api/auth-logout', {
                    method: 'POST'
                })


                if (response.status === 200)
                    window.location.pathname = `/auth/login`
            },

            signUp: async (email, password): Promise<string> => {
                const config = useRuntimeConfig()

                return await fetch('https://www.stockwise.app/api/auth-signup', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }).then(async (res) => {
                    if (res.status === 200) {
                        await fetch('https://www.stockwise.app/api/auth-login', {
                            method: 'POST',
                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        })
                        return 'success'
                    } else if (res.status === 303) {
                        // Ideally, this doesn't redirect right away but instead displays an error message give the user the option to try login with this email
                        const body = await res.json()
                        if (body.errorMessage === "UsernameExistsException") {
                            return 'userExists'
                        }
                    } else {
                        return 'error'
                    }
                })
            },

            googleLogin: async (code) => {
                await fetch('/api/auth-google-login', {
                    method: 'POST',
                    body: JSON.stringify({
                        code: code
                    })
                })
            },

            forgotPassword: async (email) => {
                await fetch('https://www.stockwise.app/api/auth-password-forgot', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: email
                    })
                })
            },

            confirmPassword: async (verificationCode, email, newPassword) => {
                return await fetch('https://www.stockwise.app/api/auth-password-confirm', {
                    method: 'POST',
                    body: JSON.stringify({
                        verificationCode: verificationCode,
                        email: email,
                        newPassword: newPassword
                    })
                }).then(res => res.status)
            }
        }
    }
})