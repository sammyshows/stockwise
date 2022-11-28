import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    ssr: false,

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
        '@pinia/nuxt'
    ],

    alias: {
        'amazon-cognito-identity-js': 'amazon-cognito-identity-js/lib'
    },

    meta: {
        meta: [
            { name: 'viewport', content: 'width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no' }
        ],
        link: [
            { rel: 'manifest', href: '/manifest.json' }
        ],
        script: [
            { src: 'https://cdn.jsdelivr.net/npm/big.js@6.2.0/big.min.js' },
            { src: '/js/polyfills.js' }
        ]
    },

    css: [
        "@/assets/css/main.css",
    ]
});
