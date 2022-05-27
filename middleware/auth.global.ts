import createAuth0Client from '@auth0/auth0-spa-js';

export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('Starting...')

    const auth0 = await createAuth0Client({
        domain: "stockwise.us.auth0.com",
        client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
        redirect_uri: window.location.origin === "http://localhost:8888" ? "http://localhost:8888/portfolios" : "https://stockwise.app/portfolios",
        audience: "https://stockwise.app/api"
    });

    let isAuthenticated = await auth0.isAuthenticated();

    console.log('Authenticated: ' + isAuthenticated)

    // auth0.logout()
    if (!isAuthenticated) {
        const query = to?.query;
        if (query && query.code && query.state) {
            await auth0.handleRedirectCallback();
            console.log(await auth0.getTokenSilently())
            // useState('authToken', async () => await auth0.getTokenSilently())
        } else {
            await auth0.loginWithRedirect();
            console.log(await auth0.getTokenSilently())
            // useState('authToken', async () => await auth0.getTokenSilently())
        }
    }

    // useState('authToken', async () => await auth0.getTokenSilently())
    navigateTo(to.path);
    console.log('done...')
});