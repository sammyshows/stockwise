<template>
  <NuxtLayout name="page-container" activeButton="notifications">
    <div class="flex flex-col grow px-3">
      <PageTitle :pageDetails="pageDetails" class="min-h-min mb-4" />

      <div class="my-auto px-6 italic">
        <h2 class="animate-pulse text-xl text-center font-medium tracking-wider text-gray-500">COMING SOON...</h2>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "Notifications",

  data() {
    return {
      pageDetails: {
        title: "News / Notifications",
        subtitle: "and more..."
      }
    }
  }
})
</script>

<style scoped>

</style>
