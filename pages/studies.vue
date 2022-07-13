<template>
  <NuxtLayout name="page-container" activeButton="studies">
    <div v-if="viewStudies" class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
        <NuxtLink :to="{ path: '/studies/new' }">
          <PlusIcon class="h-8 w-8" />
        </NuxtLink>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <NuxtPage :show="viewStudies" />
    </div>
    <NuxtPage v-else/>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";
import { useStudies } from "@/store/studies";

export default defineComponent({
  name: "Portfolio Overview",

  async setup() {
    const studyStore = useStudies()
    const token = await useState('authToken').value
    const uuid = useState('uuid').value
    return { studyStore, token, uuid }
  },

  components: {
    PlusIcon
  },

  mounted() {
    this.getStudies()
  },

  computed: {
    viewStudies() {
      return ['/studies', '/studies/completed'].includes(this.$route.path)
    }
  },

  watch: {
    $route (to, from) {
      if (from.name === 'studies-study-summary')
        this.tabConfig.activeTab = 'COMPLETED'
    }
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
      }
    }
  },

  methods: {
    async getStudies(): Promise<void> {
      const response = await fetch('/api/studies-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          uuid: this.uuid
        })
      })
        .then(response => response.json())

      this.studyStore.$patch({
        studies: response.data
      })
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>