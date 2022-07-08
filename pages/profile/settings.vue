<template>
  <div class="flex flex-col grow overflow-hidden">
    <div class="h-20 flex justify-between px-3">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <img src="~/assets/images/logo-cyan.png" class="h-12 w-12 -mt-1 mr-1" alt="Stockwise Logo">
    </div>

    <div class="overflow-scroll">
      <div class="flex flex-col gap-y-2.5 px-2">
        <NuxtLink class="w-full py-3 px-3" :to="{ path: '/profile/settings' }">
          <label for="currency" class="block text-sm">Local currency</label>
          <select id="currency" class="w-full mt-2 py-1.5 text-sm rounded-md bg-gray-600/20 border border-gray-400/40">
            <option value="AUD">AUD</option>
            <option value="USD">USD</option>
            <option value="JPY">JPY</option>
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