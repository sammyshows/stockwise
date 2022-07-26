import createAuth0Client, {Auth0Client, Auth0ClientOptions} from '@auth0/auth0-spa-js';
import jwt_decode from 'jwt-decode';

export default defineNuxtPlugin(() => {
    return {
        provide: {
            // currently login ain't even used because the middleware handles auth checks between re-routes... consider removing
            login: async () => {
                const auth0 = await createAuth0Client({
                    domain: "stockwise.us.auth0.com",
                    client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
                    audience: "https://stockwise.app/api",
                    // redirect_uri: "http://localhost:8888/portfolios"
                    redirect_uri: window.location.origin === "http://localhost:8888" ? "http://localhost:8888/portfolios" : "https://www.stockwise.app/portfolios"
                });

                let isAuthenticated = await auth0.isAuthenticated();

                if (isAuthenticated) {
                    useState('authToken', async () => await auth0.getTokenSilently())
                } else {
                    const queryString = window.location.search;
                    const query = new URLSearchParams(queryString)
                    if (query && query.get("code") && query.get("state")) {
                        await auth0.handleRedirectCallback();
                        let url = new URL(window.location.href)
                        url.searchParams.delete("code")
                        url.searchParams.delete("state")

                        window.history.replaceState(null, "", url.toString());
                        console.log('Handling redirect callback...')
                    } else {
                        await auth0.loginWithRedirect();
                        console.log('Login with redirect...')
                    }
                    useState('authToken', async () => await auth0.getTokenSilently())
                }

                const token = await auth0.getTokenSilently()
                useState('uuid', () => jwt_decode(token)["https://stockwise.app/uuid"])
            },

            logout: async () => {
                const auth0 = await useState<Auth0Client>('auth0').value
                auth0.logout({
                    returnTo: window.location.origin,
                    client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u"
                });
            }
        }
    }
})