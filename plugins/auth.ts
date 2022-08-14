import { useAuth } from "@/store/auth.js";
import { useUser } from "@/store/user.js";

export default defineNuxtPlugin(() => {
    return {
        provide: {
            login: async (email?, password?): Promise<string> => {
                const config = useRuntimeConfig()
                let message = "error" // default return message

                if (useAuth().accessToken)
                    return

                const response = await fetch('/api/auth-login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: email || null,
                        password: password || null
                    })
                }).then(async (res) => {
                    const body = await res.json()

                    if (res.status === 200) {
                        message = "authorized"
                        return body
                    }

                    if (res.status === 300) {
                        if (body.errorMessage === "LoginRequired")
                            window.location.href = `${config.public.DOMAIN}/auth/login`

                        if (body.errorMessage === "NotAuthorizedException")
                            message = "notAuthorized"
                    }
                })

                if (response.accessToken) {
                    useAuth().$patch({
                        accessToken: response.accessToken
                    })
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

                const response = await fetch('/api/auth-logout', {
                    method: 'POST'
                })


                if (response.status === 200)
                    window.location.href = `${config.public.DOMAIN}/auth/login`
            },

            signUp: async (email, password): Promise<string> => {
                const config = useRuntimeConfig()

                return await fetch('/api/auth-signup', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }).then(async (res) => {
                    if (res.status === 200) {
                        await fetch('/api/auth-login', {
                            method: 'POST',
                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        })
                        window.location.href = `${config.public.DOMAIN}/portfolios`
                    }

                    if (res.status === 303) {
                        // Ideally, this doesn't redirect right away but instead displays an error message give the user the option to try login with this email
                        const body = await res.json()
                        if (body.errorMessage === "UsernameExistsException") {
                            return 'userExists'
                        }
                    }
                    return 'error'
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
                await fetch('/api/auth-password-forgot', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: email
                    })
                })
            },

            confirmPassword: async (verificationCode, email, newPassword) => {
                return await fetch('/api/auth-password-confirm', {
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