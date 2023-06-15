import { markRaw } from 'vue'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.$pinia.use(({ store }) => {
    store.$router = markRaw(nuxtApp.$router)
  })
})