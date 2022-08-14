import { defineStore } from 'pinia'

export const useAuth = defineStore('auth', {
    state: () => {
        return {
            accessToken: null as (string | null),
            accessTokenExp: null as (string | null)
        }
    },
})