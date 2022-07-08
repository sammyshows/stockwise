<template>
  <div class="flex flex-col grow overflow-hidden">
    <div class="h-20 flex justify-between px-3">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <img src="~/assets/images/logo-cyan.png" class="h-12 w-12 -mt-1 mr-1" alt="Stockwise Logo">
    </div>

    <div class="overflow-scroll">
      <div class="flex flex-col gap-y-2.5 px-2 text-xs">
        <NuxtLink class="w-full py-3 px-3" :to="{ path: '/profile/settings' }">
          <label for="currency" class="block">Local currency</label>
          <select v-model="settings.currency" id="currency" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
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

export default defineComponent({
  name: "Portfolio Overview",

  async setup() {
    const token = await useState('authToken').value
    const uuid = useState('uuid').value
    const email = useState('email').value
    return { token, uuid, email }
  },

  components: {
    CogIcon, AnnotationIcon, PhoneIcon, ClipboardListIcon, LogoutIcon
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
      settings: {
        currency: null as (string | null)
      }
    }
  },

  methods: {
    async getHoldings(): Promise<void> {
      const response = await fetch('/api/user-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          userId: this.uuid
        })
      })
          .then(response => response.json())

      this.email = response.user.email
    }
  }
})
</script>