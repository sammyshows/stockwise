<template>
  <div class="h-full flex flex-col">
    <div v-if="$route.path === `/portfolios/${$route.params.portfolio}/holdings/new`">
      <div class="flex justify-between mb-14">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      </div>

      <p class="mb-14 text-center text-lg px-4">What type of holding would you like to add?</p>

      <div class="flex flex-col grow gap-y-10 px-10">
        <NuxtLink v-for="holdingType in holdingTypes" :to="{ path: `new/${holdingType}` }" class="w-full py-4 border-2 border-bright-cyan bg-opaque-cyan rounded-lg">
          <h2 class="text-center text-3xl uppercase">{{ holdingType }}</h2>
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