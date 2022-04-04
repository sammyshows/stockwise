<template>
  <div>
    <h1>hi index!</h1>
    <div v-for="portfolio in portfolios">
      <h1>{{ portfolio.name }}</h1>
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