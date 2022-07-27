import createAuth0Client, {Auth0Client, Auth0ClientOptions} from '@auth0/auth0-spa-js';
import jwt_decode from 'jwt-decode';

export default defineNuxtPlugin(() => {
    return {
        provide: {
            // currently login ain't even used because the middleware handles auth checks between re-routes... consider removing
            login: async () => {
                const auth0 = await useState<Promise<Auth0Client>>('auth0', async (): Promise<Auth0Client> => {
                    return await createAuth0Client({
                        domain: "stockwise.us.auth0.com",
                        client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
                        audience: "https://stockwise.app/api",
                        redirect_uri: window.location.origin === "http://localhost:8888" ? "http://localhost:8888/portfolios" : "https://www.stockwise.app/portfolios"
                    })
                }).value;

                let isAuthenticated = await auth0.isAuthenticated();
                // console.log(await auth0.isLoading)
                console.log(await auth0.isAuthenticated())

                const handleLogin = async () => {
                    if (isAuthenticated) {
                        return
                    }

                    const query = window.location.search;
                    if (query.includes("code=") && query.includes("state=")) {
                        console.log('Handling redirect callback...')
                        await auth0.handleRedirectCallback();
                        window.history.replaceState({}, "", "/");
                        return
                    }

                    console.log('Login with redirect...')
                    await auth0.loginWithRedirect({
                        redirect_uri: "http://localhost:8888/portfolios"
                    });
                }

                await handleLogin()

                const token = await auth0.getTokenSilently()
                useState('authToken', () => token)
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