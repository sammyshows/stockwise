<template>
  <div class="pt-4 border-t border-gray-300" :class="[ platform === 'ios' ? 'pb-6' : 'pb-4' ]">
    <div class="sm:block">
      <nav class="flex justify-around px-2.5" aria-label="Tabs">
        <NuxtLink to="/notifications" style="touch-action: manipulation">
          <IconsBell :class="[{ 'text-gray-800': routeBranch !== 'notifications' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/search" style="touch-action: manipulation">
          <IconsSearch :class="[{ 'text-gray-800': routeBranch !== 'search' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/" style="touch-action: manipulation">
          <IconsHome :class="[{ 'text-gray-800': routeBranch !== 'index' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/toolbox" style="touch-action: manipulation; position: relative;">
          <IconsWrench :class="[{ 'text-gray-800': routeBranch !== 'toolbox' }, 'h-10 w-10']" />
          <p class="absolute -top-1 -left-2.5 text-xs text-bright-cyan/80">NEW</p>
        </NuxtLink>
        <NuxtLink to="/profile" style="touch-action: manipulation">
          <IconsProfile :class="[{ 'text-gray-800': routeBranch !== 'profile' }, 'h-10 w-10']" />
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import { Capacitor } from '@capacitor/core'
import { useUtility } from "@/store/utility";

export default {
  name: "NavigationBar",

  setup() {
    const utilityStore = useUtility()

    return { utilityStore }
  },

  data() {
    return {
      platform: Capacitor.getPlatform()
    }
  },

  computed: {
    // ['notifications', 'search', 'index', 'toolbox', 'profile']
    routeBranch() { return this.$route.name.split('-')[0] },
  },

  watch: {
    routeBranch(newRouteName: string, oldRouteName: string) {
      this.utilityStore.logUserActivity(100, "Navigation Bar", "INFO", `User navigated to the '${this.getPageName(newRouteName)}' page.`)
    }
  },

  methods: {
    getPageName(routeName: string) {
      if (routeName === 'index')
        return 'Portfolios'
      else
        return routeName.charAt(0).toUpperCase() + routeName.slice(1);
    }
  }
}
</script>
