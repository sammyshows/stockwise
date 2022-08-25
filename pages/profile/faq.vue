<template>
  <div class="w-full h-full flex flex-col">
    <div v-if="$route.path === '/profile/faq'">
      <div class="flex justify-between h-14 mb-10 px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      </div>

      <div class="flex flex-col grow gap-y-10 px-12">
        <p class="text-sm text-center">What FAQ do you want to see?</p>

        <NuxtLink :to="{ name: 'profile-faq-transactions' }" class="w-full py-3 border-2 border-bright-cyan bg-opaque-cyan rounded-lg">
          <h2 class="text-center text-xl">TRANSACTIONS</h2>
        </NuxtLink>
        <NuxtLink :to="{ name: 'profile-faq-financial-data' }" class="w-full py-3 border-2 border-bright-cyan bg-opaque-cyan rounded-lg">
          <h2 class="text-center text-xl">FINANCIAL DATA</h2>
        </NuxtLink>
        <NuxtLink :to="{ name: 'profile-faq-studies' }" class="w-full py-3 border-2 border-bright-cyan bg-opaque-cyan rounded-lg">
          <h2 class="text-center text-xl">STUDIES</h2>
        </NuxtLink>
      </div>
    </div>
    <NuxtPage v-else @updateHoldings="$emit('updateHoldings')"></NuxtPage>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FAQ",

  data() {
    return {
      pageDetails: {
        title: 'FAQ',
        returnPath: '/profile'
      }
    }
  }
})
</script>