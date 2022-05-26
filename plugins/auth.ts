import createAuth0Client from '@auth0/auth0-spa-js';

const auth = createAuth0Client({
    domain: "stockwise.us.auth0.com",
    client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
    audience: "https://stockwise.app/api",
    redirect_uri: window.location.origin
})

export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide: {
            auth0: auth
        }
    }
})