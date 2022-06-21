<template>
  <nav class="flex justify-around mb-4" aria-label="Tabs">
    <NuxtLink v-for="tab in tabConfig.tabs" @click="updateActive(tab.name)" :to="tab.path" :class="[tab.name == tabConfig.activeTab.toUpperCase() ? 'border-white' : 'border-transparent text-gray-500 hover:text-gray-700', 'tracking-widest whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs']">
      {{ tab.name }}
    </NuxtLink>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NavigationTabs",

  props: [
    'tabConfig'
  ],

  methods: {
    updateActive(tabName: string): void {
      this.$emit('setActiveTab', tabName)
    }
  }
})
</script>