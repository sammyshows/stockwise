<template>
  <div class="flex flex-col justify-between h-full w-full">
    <NuxtLayout v-if="navRoutes.includes(routeBranch)" name="page-container">
      <NuxtPage />
    </NuxtLayout>

    <NuxtPage v-else />
  </div>
</template>

<script lang="ts">
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { useUser } from "@/store/user";

export default {
  name: "App",

  setup() {
    const userStore = useUser()

    return { userStore }
  },

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

<style scoped>
/* This ensures that this App.vue is inside a flexbox i.e. so we can position the page at the bottom when we have a top banner */
#__nuxt {
  display: flex;
}
</style>