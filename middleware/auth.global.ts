import createAuth0Client from '@auth0/auth0-spa-js';



export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('Starting...')

    const auth = await createAuth0Client({
        domain: "stockwise.us.auth0.com",
        client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
        redirect_uri: "http://localhost:8888/portfolios",
        audience: "https://stockwise.app/api"
    });

    let isAuthenticated = await auth.isAuthenticated();
    if (to.path === "/" && !to?.query?.code) {
        return;
    }
    console.log(isAuthenticated)
    // auth.logout()
    if (!isAuthenticated) {
        const query = to?.query;
        if (query && query.code && query.state) {
            await auth.handleRedirectCallback();
        } else {
            await auth.loginWithRedirect();
        }
    } else {
        console.log("logged in ", to.path);
    }

    navigateTo(to.path);
    console.log('done...')
});