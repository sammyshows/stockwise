// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    ssr: false,

    security: {
        rateLimiter: {
            toeknsPerInterval: 100,
        }
    },

    experimental: {
        treeshakeClientOnly: false
    },

    runtimeConfig: {
        public: {
            DOMAIN: process.env.DOMAIN,
            AWS_AUTH_URL: process.env.AWS_AUTH_URL,
            AWS_CLIENT_ID: process.env.AWS_CLIENT_ID
        }
    },

    build: {
        transpile: [
            '@heroicons/vue'
        ]
    },

    modules: [
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        'nuxt-security'
    ],

    alias: {
        'amazon-cognito-identity-js': 'amazon-cognito-identity-js/lib'
    },

    app: {
        head: {
            meta: [
                { name: 'viewport', content: 'viewport-fit=cover, width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no' }
            ],
            script: [
                { src: 'https://cdn.jsdelivr.net/npm/big.js@6.2.0/big.min.js' },
                { src: '/js/polyfills.js' }
            ]
        }
    },

    css: [
        "@/assets/css/main.css",
    ]
});
