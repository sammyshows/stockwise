<template>
  <NuxtLayout name="page-container" activeButton="studies">
    <div v-if="['/studies', '/studies/completed'].includes($route.path)" class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
        <NuxtLink :to="{ path: '/studies/new' }">
          <PlusIcon class="h-8 w-8" />
        </NuxtLink>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <NuxtChild :uncompletedStudies="uncompletedStudies" :completedStudies="completedStudies" />
    </div>
    <NuxtChild v-else/>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";

export default defineComponent({
  name: "Portfolio Overview",

  components: {
    PlusIcon
  },

  mounted() {
    this.getStudies()
  },

  data() {
    return {
      pageDetails: {
        title: 'Studies'
      },
      tabConfig: {
        activeTab: this.$route.name === 'studies-completed' ? 'COMPLETED' : 'IN PROGRESS',
        tabs: [
          { name: 'IN PROGRESS', path: `/studies` },
          { name: 'COMPLETED', path: `/studies/completed` }
        ]
      },
      uncompletedStudies: [],
      completedStudies: []
    }
  },

  methods: {
    async getStudies(): Promise<void> {
      const response = await fetch('/api/studies-read', {
        method: 'GET'
      })
          .then(response => response.json())
      this.uncompletedStudies = response.data.filter(study => study.completed === false)
      this.completedStudies = response.data.filter(study => study.completed === true)
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>