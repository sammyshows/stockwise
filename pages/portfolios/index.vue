<template>
  <div>
    <div v-for="portfolio in portfolios" class="h-16">
      <h2 class="font-bold">{{ portfolio.name }}</h2>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Portfolios",

  props: ['portfolios']
})
</script>