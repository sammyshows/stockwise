import { Capacitor } from '@capacitor/core';
import { TextZoom } from "@capacitor/text-zoom";

export default defineNuxtPlugin(() => {
    if (Capacitor.getPlatform() === 'ios')
    TextZoom.set({
        value: 1.1
    })
})