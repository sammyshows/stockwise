<template>
  <nav class="flex justify-around mb-5" aria-label="Tabs">
    <NuxtLink v-for="tab in tabConfig.tabs" @click="updateActive(tab.name)" :to="tab.path" :class="[tab.name == activeTab.toUpperCase() ? 'border-cyan-300 text-cyan-300' : 'border-transparent text-gray-500 hover:text-gray-700', 'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs']">
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

  data() {
    return {
      activeTab: this.tabConfig?.activeTab
    }
  },

  methods: {
    updateActive(tabName: string): void {
      this.activeTab = tabName
    }
  }
})
</script>