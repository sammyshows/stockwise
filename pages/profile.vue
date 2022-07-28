<template>
  <NuxtLayout name="page-container" activeButton="profile">
    <div v-if="$route.path === '/profile'" class="flex flex-col grow overflow-hidden">
      <div class="min-h-min flex justify-between px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <img src="/images/logo-cyan.png" class="h-10 -mt-1 mr-1" alt="Stockwise Logo">
      </div>

      <div class="overflow-scroll">
        <div class="flex flex-col gap-y-2.5 mt-8 px-7">
          <NuxtLink class="flex items-center w-full py-3 px-3 rounded-2xl bg-gray-600/20" :to="{ path: '/profile/settings' }">
            <CogIcon class="h-6 text-bright-cyan" />
            <p class="ml-6 text-sm">Settings</p>
          </NuxtLink>
          <div class="flex items-center w-full py-3 px-3 rounded-2xl bg-gray-600/20">
            <AnnotationIcon class="h-6 text-bright-cyan" />
            <p class="ml-6 text-sm">Frequently Asked Questions</p>
          </div>
          <div class="flex items-center w-full py-3 px-3 rounded-2xl bg-gray-600/20">
            <PhoneIcon class="h-6 text-bright-cyan" />
            <p class="ml-6 text-sm">Contact Us</p>
          </div>
          <div class="flex items-center w-full py-3 px-3 rounded-2xl bg-gray-600/20">
            <ClipboardListIcon class="h-6 text-bright-cyan" />
            <p class="ml-6 text-sm">Terms and Privacy Policy</p>
          </div>
          <div @click="$logout()" class="flex items-center w-full py-3 px-3 rounded-2xl bg-gray-600/20">
            <LogoutIcon class="h-6 text-red-400" />
            <p class="ml-6 text-sm">Log Out</p>
          </div>
          <div @click="login" class="flex items-center w-full py-3 px-3 rounded-2xl bg-gray-600/20">
            <LogoutIcon class="h-6 text-bright-cyan" />
            <p class="ml-6 text-sm">Log In</p>
          </div>
        </div>
      </div>
    </div>
    <NuxtPage v-else :userSettings="userSettings" />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CogIcon, AnnotationIcon, PhoneIcon, ClipboardListIcon, LogoutIcon } from "@heroicons/vue/outline";
import createAuth0Client from "@auth0/auth0-spa-js";

export default defineComponent({
  name: "Portfolio Overview",

  // async setup() {
  //   const token = await useState('authToken').value
  //   const uuid = useState('uuid').value
  //   return { token, uuid }
  // },

  components: {
    CogIcon, AnnotationIcon, PhoneIcon, ClipboardListIcon, LogoutIcon
  },

  async mounted() {
    setTimeout(async () => {
      await this.$login() // temp until nuxt3 auth is released, allowing ssr auth on route change (see '~/middleware/auth/global.ts')
      this.token = await useState('authToken').value
      this.uuid = useState('uuid').value
      await this.getUserSettings()
    }, 3000)
  },

  data() {
    return {
      token: '',
      uuid: '',
      pageDetails: {
        title: 'Profile'
      },
      userSettings: {}
    }
  },

  methods: {
    async getUserSettings(): Promise<void> {
      const response = await fetch('/api/user-settings-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          userId: this.uuid
        })
      })
        .then(response => response.json())

      this.userSettings = response.data
    },

    async login() {
      const auth0 = await createAuth0Client({
        domain: "stockwise.us.auth0.com",
        client_id: "fkOrDjhrepusnXmq9eWbGFxGl5W4Rm8u",
        audience: "https://stockwise.app/api",
        redirect_uri: window.location.origin === "http://localhost:8888" ? "http://localhost:8888/portfolios" : "https://www.stockwise.app/portfolios"
      })

      console.log('Login with redirect...')
      await auth0.loginWithRedirect({
          audience: "https://stockwise.app/api",
          redirect_uri: window.location.origin === "http://localhost:8888" ? "http://localhost:8888?chicken=beak" : "https://www.stockwise.app/portfolios"
      })
    }
  }
})
</script>