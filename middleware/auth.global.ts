import createAuth0Client, { Auth0Client } from '@auth0/auth0-spa-js';
import jwt_decode from 'jwt-decode';

export default defineNuxtRouteMiddleware(async (to, from) => {
    // this is added to state so that when this script runs, it will return immediately if state 'auth0'
    // already exists i.e. there hasn't been a page refresh
    const auth0 = await useState<Promise<Auth0Client>>('auth0', async (): Promise<Auth0Client> => {
        return await createAuth0Client({
            domain: "stockwise.us.auth0.com",
            client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
            redirect_uri: window.location.origin === "http://localhost:8888" ? "http://localhost:8888/portfolios" : "https://www.stockwise.app/portfolios",
            audience: "https://stockwise.app/api"
        })
    }).value;

    let isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
        useState('authToken', async () => await auth0.getTokenSilently())
    } else {
        const query = to?.query;
        if (query && query.code && query.state) {
            await auth0.handleRedirectCallback();
            console.log('Handling redirect callback...')
        } else {
            await auth0.loginWithRedirect();
            console.log('Login with redirect...')
        }
        useState('authToken', async () => await auth0.getTokenSilently())
    }

    const token = await auth0.getTokenSilently()
    useState('uuid', () => jwt_decode(token)["https://stockwise.app/uuid"])
    useState('email', () => jwt_decode(token)["https://stockwise.app/email"])

    navigateTo(to.path);
});