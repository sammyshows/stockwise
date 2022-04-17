<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between mb-10">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div v-if="$route.path === `/portfolios/${$route.params.portfolio}/holdings/new`">
      <div class="flex flex-col grow gap-y-10 px-12">
        <p class="text-sm text-center">What type of holding would you like to add?</p>
        <NuxtLink v-for="holdingType in holdingTypes" :to="{ path: `new/${holdingType}` }" class="w-full py-3 border-2 border-bright-cyan bg-opaque-cyan rounded-lg">
          <h2 class="text-center text-xl uppercase">{{ holdingType }}</h2>
        </NuxtLink>
      </div>
    </div>
    <NuxtPage v-else></NuxtPage>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "New Holding",

  data() {
    return {
      pageDetails: {
        title: 'Add Holding',
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      holdingTypes: ['stock', 'forex', 'cash']
    }
  }
})
</script>

<style scoped>

</style>