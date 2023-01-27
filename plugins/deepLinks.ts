import { App, URLOpenListenerEvent } from '@capacitor/app';

export default defineNuxtPlugin(() => {
    App.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
        // Example url: https://stockwise.app/tabs/tabs2
        // slug = /tabs/tabs2
        const slug = event.url.split('.app').pop();

        if (slug) {
            window.location.href = slug
        }
    })
})