import createAuth0Client, {Auth0Client, Auth0ClientOptions} from '@auth0/auth0-spa-js';
import jwt_decode from 'jwt-decode';

export default defineNuxtPlugin(() => {
    return {
        provide: {
            login: async () => {
                console.log('hey')
                const auth0 = await useState<Promise<Auth0Client>>('auth0', async (): Promise<Auth0Client> => {
                    return await createAuth0Client({
                        domain: "stockwise.us.auth0.com",
                        client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
                        audience: "https://stockwise.app/api",
                        redirect_uri: window.location.origin === "http://localhost:8888" ? "http://localhost:8888/portfolios" : "https://www.stockwise.app/portfolios"
                    })
                }).value;

                console.log('heya')
                let isAuthenticated = await auth0.isAuthenticated();

                const handleLogin = async () => {
                    console.log('hey ya')
                    if (isAuthenticated) {
                        return
                    }
                    console.log('you think you got it ooooohhhhhhh you think you got it')

                    const queryString = window.location.search;
                    const query = new URLSearchParams(queryString)
                    console.log(query && query.get("code") && query.get("state"))
                    if (query && query.get("code") && query.get("state")) {
                        console.log('Handling redirect callback...')
                        await auth0.handleRedirectCallback();
                        window.history.replaceState({}, "", "/");
                        return
                    } else {
                        console.log('Login with redirect...')
                        await auth0.loginWithRedirect();
                    }
                }

                await handleLogin()

                const token = await auth0.getTokenSilently()
                useState('authToken', () => token)
                useState('uuid', () => jwt_decode(token)["https://stockwise.app/uuid"])
            },

            logout: async () => {
                const auth0 = await useState<Auth0Client>('auth0').value
                auth0.logout({
                    returnTo: window.location.origin === "http://localhost:8888" ? "http://localhost:8888/portfolios" : "https://www.stockwise.app",
                    client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u"
                });
            }
        }
    }
})