<template>
  <div class="pt-4">
    <div class="sm:block">
      <nav class="flex justify-around px-2.5" aria-label="Tabs">
        <NuxtLink to="/notifications">
          <BellIcon :class="[{ 'text-gray-700': activeButton !== 'notifications' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/search">
          <SearchIcon :class="[{ 'text-gray-700': activeButton !== 'search' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/portfolios">
          <HomeIcon :class="[{ 'text-gray-700': activeButton !== 'overview' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/studies">
          <DocumentSearchIcon :class="[{ 'text-gray-700': activeButton !== 'studies' }, 'h-10 w-10']" />
        </NuxtLink>
        <NuxtLink to="/profile">
          <UserCircleIcon :class="[{ 'text-gray-700': activeButton !== 'profile' }, 'h-10 w-10']" />
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

  props: ['activeButton']
}
</script>
