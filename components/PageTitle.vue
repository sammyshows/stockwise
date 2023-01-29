<template>
  <div class="flex h-14 ml-5 mr-2 overflow-hidden">
    <NuxtLink v-if="pageDetails?.returnPath" :to="pageDetails?.returnPath" @click="logNavigation()" style="touch-action: manipulation">
      <ChevronLeftIcon class="h-8 w-8 mr-6 -ml-2.5" />
    </NuxtLink>

    <img v-if="pageDetails.showLogo === true" style="max-width: 5.5rem;" class="h-11 mr-4 object-contain" :src="`https://storage.googleapis.com/iexcloud-hl37opg/api/logos/${pageDetails.symbol}.png`" >

    <h1 v-if="!pageDetails.subtitle" class="text-2xl font-medium truncate">{{ pageDetails.title }}</h1>

    <div v-if="pageDetails.subtitle" class="overflow-hidden">
      <h1 class="text-lg font-medium truncate">{{ pageDetails.title }}</h1>
      <p v-if="pageDetails.title" class="text-xs truncate">{{ pageDetails.subtitle }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { ChevronLeftIcon} from "@heroicons/vue/outline";

export default {
  name: "PageTitle",

  props: [
    'pageDetails'
  ],

  components: {
    ChevronLeftIcon
  },

  methods: {
    logNavigation(path: string) {
      if (this.pageDetails.logCode)
        this.utilityStore.logUserActivity(this.pageDetails.logCode, this.pageDetails.logSource, "INFO", `User navigated back to the '${this.pageDetails.logTo}' page.`)
    }
  }
}
</script>

<style>

</style>