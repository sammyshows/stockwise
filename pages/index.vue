<template>
  <div class="h-full w-screen flex items-center justify-center">
<!--    <NuxtLink :to="{ path: `/portfolios` }">-->
<!--      <h1 class="text-2xl py-5 px-10 bg-blue-400 rounded-2xl">PORTFOLIOS -&ndash;&gt;</h1>-->
<!--    </NuxtLink>-->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Index",

  beforeCreate() {
    this.$router.push('/portfolios')
  }
})
</script>