import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    buildModules: ['@vueuse/nuxt'],

    modules: ['@nuxtjs/tailwindcss'],

    auth: {
        strategies: {
            auth0: {
                domain: 'dev-gyplclm4.us.auth0.com',
                clientId: 'd30JYDEwwCxnMxLlH97ILh1o7h584Vm0',
                audience: 'https://stockwise-api.app/'
            }
        }
    },

    meta: {
        link: [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;500&display=swap' }
        ]
    },

    css: [
        "@/assets/css/main.css",
    ]
});
