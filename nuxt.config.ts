import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    buildModules: [
        '@vueuse/nuxt', '@nuxtjs/pwa'
    ],

    modules: [
        '@nuxtjs/tailwindcss'
    ],

    pwa: {
        manifest: {
            name: 'Stockwise',
            shortName: 'Stockwise',
            description: 'An app for studying stocks and tracking your wealth',
            icons: [
                {
                    "src": "https://www.mustakbil.com/content/images/ic_launcher.png",
                    "sizes": "192x192",
                    "type": "image/png"
                }
            ],
            start_url: "/",
            display: 'standalone',
            background_color: '#000',
            theme_color: '#000'
        }
    },

    meta: {
        meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
        ],
        link: [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700&display=swap' }
        ]
    },

    css: [
        "@/assets/css/main.css",
    ]
});
