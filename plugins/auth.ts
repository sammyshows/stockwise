import createAuth0Client, {Auth0Client, Auth0ClientOptions} from '@auth0/auth0-spa-js';

const auth0options = {
    domain: "stockwise.us.auth0.com",
    client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
    audience: "https://stockwise.app/api",
    redirect_uri: window.location.origin === "http://localhost:8888" ? "http://localhost:8888/portfolios" : "https://www.stockwise.app/portfolios"
}

export default defineNuxtPlugin(() => {
    return {
        provide: {
            login: async () => {
                console.log('hola')
                const auth0 = await createAuth0Client(auth0options);
                const authenticated = await auth0.isAuthenticated()

                if (authenticated) {
                    useState('authToken', async () => await auth0.getTokenSilently())
                    return auth0;
                }

                let urlParams = new URLSearchParams(window.location.search)
                if (urlParams.has("code")) { // auth0 login code
                    await auth0.handleRedirectCallback();
                    let u = new URL(window.location.href)
                    u.searchParams.delete("code")
                    u.searchParams.delete("state")

                    window.history.replaceState(null, "", u.toString());
                    return auth0
                }

                await auth0.loginWithRedirect()
                return auth0;
            },

            logout: async () => {
                const auth0 = await createAuth0Client(auth0options);
                auth0.logout()
            }
        }
    }
})