import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        '@kevinmarrec/nuxt-pwa',
        '@nuxtjs/pwa'
    ],

    meta: {
        meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
        ],
        link: [
            { rel: 'manifest', href: '/manifest.json' },
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
    ],

    pwa: {
        meta: {
            author: '@sammyshows',
            theme_color: '#FFFFFF'
        },

        icon: {
            source: 'static/icon.png'
        },

        manifest: {
            start_url: '/portfolios?standalone=true',
            name: 'Stockwise',
            short_name: 'Stockwise',
            description: 'Stockwiseeeee brings you the ability to track your portfolios and study companies in one place.',
            lang: 'en',
            display: 'standalone',
            orientation: 'portrait',
            theme_color: '#FFE100',
            background_color: '#FFE100'
        },

        workbox: {
            enabled: true
        }
    }
});
