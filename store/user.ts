import { defineStore } from 'pinia'
import { Capacitor } from '@capacitor/core';


export const useUser = defineStore('user', {
    state: () => {
        return {
            userId: '',
            currency: '',
            platform: Capacitor.getPlatform()
        }
    },
})