<template>
  <div class="flex h-14 ml-5">
    <NuxtLink v-if="pageDetails?.returnPath" :to="pageDetails?.returnPath">
      <ChevronLeftIcon class="h-8 w-8 mr-6 -ml-2.5" />
    </NuxtLink>

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
  }
}
</script>

<style>

</style>