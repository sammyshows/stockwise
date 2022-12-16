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

export default {
  name: "NavigationBar",

  components: {
    BellIcon, SearchIcon, HomeIcon, DocumentSearchIcon, UserCircleIcon
  },

  computed: {
    routeBranch() {
      // ['notifications', 'search', 'index', 'studies', 'profile']
      return this.$route.name.split('-')[0]
    }
  }
}
</script>
