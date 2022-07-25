<template>
  <div class="flex flex-col grow overflow-hidden">
    <div class="h-20 flex justify-between px-3">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <img src="/images/logo-cyan.png" class="h-10 -mt-1 mr-1" alt="Stockwise Logo">
    </div>

    <div class="overflow-scroll">
      <div class="flex flex-col gap-y-2.5 px-2 text-xs">
        <NuxtLink class="w-full py-3 px-3" :to="{ path: '/profile/settings' }">
          <label for="currency" class="block">Local currency</label>
          <select v-model="settings.currency" @change="updateUserSettings()" id="currency" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            <option v-for="currency in currencies" :value="currency">{{ currency }}</option>
          </select>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { CogIcon, AnnotationIcon, PhoneIcon, ClipboardListIcon, LogoutIcon } from "@heroicons/vue/outline";
import { useUser } from "@/store/user";

export default defineComponent({
  name: "Portfolio Overview",

  async setup() {
    const userStore = useUser()
    const token = await useState('authToken').value
    const uuid = useState('uuid').value
    return { userStore, token, uuid }
  },

  props: [
    'userSettings'
  ],

  components: {
    CogIcon, AnnotationIcon, PhoneIcon, ClipboardListIcon, LogoutIcon
  },

  watch: {
    userSettings() {
      this.settings = this.userSettings
    }
  },

  data() {
    return {
      pageDetails: {
        title: 'Settings',
        subtitle: 'PROFILE',
        returnPath: '/profile'
      },
      currencies: [
        'AUD', 'CAD', 'CHF', 'CNH', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'ILS', 'INR', 'JPY', 'MXN', 'NOK', 'NZD', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR'
      ],
      settings: this.userSettings
    }
  },

  methods: {
    async updateUserSettings(): Promise<void> {
      const response = await fetch('/api/user-settings-update', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify(this.settings)
      })

      if (response.status === 200) {
        this.userStore.$patch({
          currency: this.settings?.currency
        })
      }
    }
  }
})
</script>