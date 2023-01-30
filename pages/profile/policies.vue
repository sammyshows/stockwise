<template>
  <div class="w-full h-full flex flex-col">
    <div v-if="$route.path === '/profile/policies'">
      <div class="flex justify-between h-14 mb-10 px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      </div>

      <div class="flex flex-col grow gap-y-5 px-12">
        <NuxtLink :to="{ name: 'profile-policies-terms' }" style="touch-action: manipulation" class="w-full py-3 border-2 border-bright-cyan bg-opaque-cyan rounded-lg">
          <h2 class="text-center text-lg">TERMS AND CONDITIONS</h2>
        </NuxtLink>
        <NuxtLink :to="{ name: 'profile-policies-privacy' }" style="touch-action: manipulation" class="w-full py-3 border-2 border-bright-cyan bg-opaque-cyan rounded-lg">
          <h2 class="text-center text-lg">PRIVACY POLICY</h2>
        </NuxtLink>
      </div>
    </div>
    <NuxtPage v-else @updateHoldings="$emit('updateHoldings')"></NuxtPage>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Policies",

  data() {
    return {
      pageDetails: {
        title: 'Policies',
        subtitle: 'PROFILE',
        returnPath: '/profile',
        logCode: 140,
        logSource: 'Terms and Privacy Policy Page',
        logTo: 'Profile'
      }
    }
  }
})
</script>