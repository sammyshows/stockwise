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
        </div>
      </div>
    </div>
    <NuxtPage v-else :userSettings="userSettings" />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CogIcon, AnnotationIcon, PhoneIcon, ClipboardListIcon, LogoutIcon } from "@heroicons/vue/outline";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";


export default defineComponent({
  name: "Portfolio Overview",

  async setup() {
    const authStore = useAuth()
    const userStore = useUser()
    return { authStore, userStore }
  },

  components: {
    CogIcon, AnnotationIcon, PhoneIcon, ClipboardListIcon, LogoutIcon
  },

  async mounted() {
    await this.$login() // temp until nuxt3 auth is released, allowing ssr auth on route change (see '~/middleware/auth/global.ts')
    this.token = this.authStore.accessToken
    this.uuid = this.userStore.userId
    await this.getUserSettings()
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
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          userId: this.uuid
        })
      })
        .then(response => response.json())

      this.userSettings = response.data
    }
  }
})
</script>