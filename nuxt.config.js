import { defineNuxtConfig } from 'nuxt'
import { VitePWA } from 'vite-plugin-pwa'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    ssr: false,

    buildModules: [
        '@vueuse/nuxt'
    ],

    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        'nuxt-vite'
    ],

    vite: {
        plugins: [
            VitePWA({
                registerType: 'autoUpdate',
                devOptions: {
                    enabled: true
                }
            })
        ]
    },

    // pwa: {
    //     icon: {
    //         source: 'static/icon.png'
    //     },
    //
    //     manifest: {
    //         // id: 'https://www.stockwise.app/portfolios/',
    //         // start_url: 'https://www.stockwise.app/',
    //         // scope: 'https://www.stockwise.app/',
    //         name: 'Stockwise',
    //         lang: 'en',
    //         orientation: 'portrait'
    //     }
    // },

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
