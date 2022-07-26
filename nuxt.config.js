import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    ssr: false,

    buildModules: [
        '@vueuse/nuxt'
    ],

    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        '@kevinmarrec/nuxt-pwa'
    ],

    pwa: {
        workbox: {
            enabled: true
        },

        meta: {
            author: '@zeebats',
            description: 'Internet\'s Zuurste Memes',
            favicon: false,
            mobileAppIOS: true,
            name: '',
            theme_color: '#FFFFFF'
        },

        icon: {
            source: 'static/icon.png'
        },

        manifest: {
            // id: 'https://www.stockwise.app/portfolios/',
            start_url: 'https://www.stockwise.app/portfolios',
            name: 'Stockwise',
            short_name: 'Stockwise',
            description: 'Stockwise brings you the ability to track your portfolios and study companies in one place.',
            lang: 'en',
            display: 'standalone',
            orientation: 'portrait',
            theme_color: '#FFE100',
            background_color: '#FFE100'
        }
    },

    meta: {
        meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
        ],
        link: [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap' }
        ],
        script: [
            {
                src: 'https://cdn.jsdelivr.net/npm/big.js@6.2.0/big.min.js'
            }
        ]
    },

    css: [
        "@/assets/css/main.css",
    ]
});
