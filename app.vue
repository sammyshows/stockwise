<template>
  <div class="flex flex-col justify-between h-screen w-screen">
    <NuxtLayout v-if="navRoutes.includes(routeBranch)" name="page-container">
      <NuxtPage />
    </NuxtLayout>

    <NuxtPage v-else />
  </div>
</template>

<script>

export default {
  name: "App",

  data() {
    return {
      navRoutes: ['notifications', 'search', 'index', 'studies', 'profile']
    }
  },

  computed: {
    // ['notifications', 'search', 'index', 'studies', 'profile']
    routeBranch() { return this.$route.name.split('-')[0] }
  }
}
</script>