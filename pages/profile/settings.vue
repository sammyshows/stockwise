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
import { useAuth } from "@/store/auth";

export default defineComponent({
  name: "Portfolio Overview",

  async setup() {
    const userStore = useUser()
    const authStore = useAuth()
    return { userStore, authStore }
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

  mounted() {
    this.token = this.authStore.accessToken
    this.uuid = this.userStore.userId
  },

  data() {
    return {
      token: '',
      userId: '',
      pageDetails: {
        title: 'Settings',
        subtitle: 'PROFILE',
        returnPath: '/profile'
      },
      currencies: [
          'AUD - Australian Dollar', 'CAD - Canadian Dollar', 'CHF - Swiss Franc', 'CNH - Chinese Yuan Renminbi (HK)', 'CZK - Czech Koruna', 'DKK - Danish Krone', 'EUR - Euro', 'GBP - British Pound', 'HKD - Hong Kong Dollar', 'HUF - Hungarian Forint', 'ILS - Israeli New Shekel', 'INR - Indian Rupee', 'JPY - Japanese Yen', 'MXN - Mexican Peso', 'NOK - Norwegian Krone', 'NZD - New Zealand Dollar', 'PLN - Polish Zloty', 'RON - Romanian Leu', 'RUB - Russian Ruble', 'SEK - Swedish Krona', 'SGD - Singapore Dollar', 'THB - Thai Baht', 'TRY - Turkish Lira', 'USD - U.S. Dollar', 'ZAR - South African Rand'
      ],
      settings: this.userSettings
    }
  },

  methods: {
    async updateUserSettings(): Promise<void> {
      const response = await fetch('/api/user-settings-update', {
        headers: {
          authorization: this.token
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