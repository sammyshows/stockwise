import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    ssr: false,

    buildModules: [
        '@vueuse/nuxt'
    ],

    modules: [
        '@nuxtjs/tailwindcss'
    ],

    meta: {
        meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
        ],
        link: [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap' }
        ]
    },

    css: [
        "@/assets/css/main.css",
    ]
});
