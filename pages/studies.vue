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
      <div v-if="$route.path === '/studies'" class="flex grow">
        <p v-if="uncompletedStudies != null && uncompletedStudies.length === 0" class="grow flex items-center justify-center px-2 text-sm text-bright-cyan text-center">To start a study, use the "+" icon above</p>
        <NuxtPage v-else-if="uncompletedStudies" :show="viewStudies" />
        <Spinner class="h-full" v-else />
      </div>
      <div v-else-if="$route.path === '/studies/completed'" class="flex grow">
        <p v-if="uncompletedStudies != null && uncompletedStudies.length === 0" class="grow flex items-center justify-center px-2 text-sm text-bright-cyan text-center">To start a study, use the "+" icon above</p>
        <NuxtPage v-else-if="uncompletedStudies" :show="viewStudies" />
        <Spinner class="h-full" v-else />
      </div>
    </div>
    <NuxtPage v-else/>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";
import { computed } from "@vue/reactivity";
import { useStudies } from "@/store/studies";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";


export default defineComponent({
  name: "Studies",

  async setup() {
    const studyStore = useStudies()
    const uncompletedStudies = computed(() => studyStore.getUncompleted())
    const authStore = useAuth()
    const userStore = useUser()
    return { studyStore, uncompletedStudies, authStore, userStore }
  },

  components: {
    PlusIcon
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.uuid = this.userStore.userId
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

      if (to.name === 'studies')
        this.tabConfig.activeTab = 'IN PROGRESS'
    }
  },

  data() {
    return {
      token: '',
      uuid: '',
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
          authorization: this.token
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