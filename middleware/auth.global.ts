import createAuth0Client from '@auth0/auth0-spa-js';

export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('Starting...')

    const auth0 = await createAuth0Client({
        domain: "stockwise.us.auth0.com",
        client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
        redirect_uri: "https://stockwise.app/portfolios",
        audience: "https://stockwise.app/api"
    });

    console.log('gday')

    useState('authToken', async () => await auth0.getTokenSilently())

    let isAuthenticated = await auth0.isAuthenticated();
    if (to.path === "/" && !to?.query?.code) {
        return;
    }
    console.log(isAuthenticated)
    // auth.logout()
    if (!isAuthenticated) {
        const query = to?.query;
        if (query && query.code && query.state) {
            await auth0.handleRedirectCallback();
        } else {
            await auth0.loginWithRedirect();
        }
    } else {
        console.log("logged in ", to.path);
    }

    navigateTo(to.path);
    console.log('done...')
});