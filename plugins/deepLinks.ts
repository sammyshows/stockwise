import { App, URLOpenListenerEvent } from '@capacitor/app';

export default defineNuxtPlugin((app) => {
    App.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
        // Example url: https://beerswift.app/tabs/tabs2
        // slug = /tabs/tabs2
        const slug = event.url.split('.app').pop();

        // We only push to the route if there is a slug present
        if (slug) {
            app.router.push(slug)
        }
    })
})