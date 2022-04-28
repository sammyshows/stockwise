import { defineNuxtPlugin } from '#app'
import Datepicker from 'vue3-datepicker'
console.log(Datepicker)


export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('Datepicker', Datepicker)
})
