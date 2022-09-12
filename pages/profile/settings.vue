<template>
  <div class="flex flex-col grow overflow-hidden">
    <div class="h-20 flex justify-between px-3">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <img src="/images/logo-cyan.png" class="h-10 -mt-1 mr-1" alt="Stockwise Logo">
    </div>

    <div class="overflow-scroll">
      <div class="flex flex-col gap-y-2.5 px-2 text-xs">
        <div class="w-full py-3 px-3">
          <label for="currency" class="block">Local currency</label>
          <select v-model="settings.currency" @change="updateUserSettings()" id="currency" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            <option v-for="currency in currencies" :value="currency.ticker">{{ currency.ticker + ' - ' + currency.name }}</option>
          </select>
        </div>
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

  components: {
    CogIcon, AnnotationIcon, PhoneIcon, ClipboardListIcon, LogoutIcon
  },

  watch: {
    userSettings() {
      this.settings = this.userSettings
    }
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.uuid = this.userStore.userId
    this.getUserSettings()
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
        { ticker: 'AUD', name: 'Australian Dollar' },
        { ticker: 'CAD', name: 'Canadian Dollar' },
        { ticker: 'CHF', name: 'Swiss Franc' },
        { ticker: 'CNH', name: 'Chinese Yuan Renminbi (HK)' },
        { ticker: 'CZK', name: 'Czech Koruna' },
        { ticker: 'DKK', name: 'Danish Krone' },
        { ticker: 'EUR', name: 'Euro' },
        { ticker: 'GBP', name: 'British Pound' },
        { ticker: 'HKD', name: 'Hong Kong Dollar' },
        { ticker: 'HUF', name: 'Hungarian Forint' },
        { ticker: 'ILS', name: 'Israeli New Shekel' },
        { ticker: 'INR', name: 'Indian Rupee' },
        { ticker: 'JPY', name: 'Japanese Yen' },
        { ticker: 'MXN', name: 'Mexican Peso' },
        { ticker: 'NOK', name: 'Norwegian Krone' },
        { ticker: 'NZD', name: 'New Zealand Dollar' },
        { ticker: 'PLN', name: 'Polish Zloty' },
        { ticker: 'RON', name: 'Romanian Leu' },
        { ticker: 'RUB', name: 'Russian Ruble' },
        { ticker: 'SEK', name: 'Swedish Krona' },
        { ticker: 'SGD', name: 'Singapore Dollar' },
        { ticker: 'THB', name: 'Thai Baht' },
        { ticker: 'TRY', name: 'Turkish Lira' },
        { ticker: 'USD', name: 'U.S. Dollar' },
        { ticker: 'ZAR', name: 'South African Rand' }
      ],
      settings: {
        id: this.userStore?.id,
        currency: this.userStore?.currency
      }
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

      this.settings.id = response.data.id
      this.settings.currency = response.data.currency

      this.userStore.$patch({
        currency: response.data.currency
      })
    },

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