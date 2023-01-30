<template>
  <div class="pt-4 border-t border-gray-300">
    <div class="sm:block">
      <nav class="flex justify-around px-2.5" aria-label="Tabs">
        <NuxtLink to="/notifications" style="touch-action: manipulation">
          <BellIcon :class="[{ 'text-gray-800': routeBranch !== 'notifications' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/search" style="touch-action: manipulation">
          <SearchIcon :class="[{ 'text-gray-800': routeBranch !== 'search' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/" style="touch-action: manipulation">
          <HomeIcon :class="[{ 'text-gray-800': routeBranch !== 'index' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/studies" style="touch-action: manipulation">
          <DocumentSearchIcon :class="[{ 'text-gray-800': routeBranch !== 'studies' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/profile" style="touch-action: manipulation">
          <UserCircleIcon :class="[{ 'text-gray-800': routeBranch !== 'profile' }, 'h-10 w-10']" />
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import { BellIcon, SearchIcon, HomeIcon, DocumentSearchIcon, UserCircleIcon } from '@heroicons/vue/outline'
import { useUtility } from "@/store/utility";

export default {
  name: "NavigationBar",

  setup() {
    const utilityStore = useUtility()

    return { utilityStore }
  },

  components: {
    BellIcon, SearchIcon, HomeIcon, DocumentSearchIcon, UserCircleIcon
  },

  computed: {
    // ['notifications', 'search', 'index', 'studies', 'profile']
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
