<template>
  <div class="flex flex-col justify-between h-full">
    <div v-if="viewStudies" class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
        <NuxtLink :to="{ path: '/toolbox/studies/new' }" style="touch-action: manipulation">
          <PlusIcon class="h-8 w-8" />
        </NuxtLink>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <div v-if="$route.path === '/toolbox/studies'" class="flex grow">
        <p v-if="uncompletedStudies != null && uncompletedStudies.length === 0" class="grow flex items-center justify-center px-2 text-sm text-bright-cyan text-center">To start a study, use the "+" icon above</p>
        <NuxtPage v-else-if="uncompletedStudies" :show="viewStudies" />
        <Spinner class="h-full" v-else />
      </div>
      <div v-else-if="$route.path === '/toolbox/studies/completed'" class="flex grow">
        <p v-if="completedStudies != null && completedStudies.length === 0" class="grow flex items-center justify-center px-2 text-sm text-bright-cyan text-center">To start a study, use the "+" icon above</p>
        <NuxtPage v-else-if="completedStudies" :show="viewStudies" />
        <Spinner class="h-full" v-else />
      </div>
    </div>
    <NuxtPage v-else/>

    <AnimationsFullScreenText v-if="accessGranted" text="Access Granted" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";
import { computed } from "@vue/reactivity";
import { useStudies } from "@/store/studies";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { useUtility } from "@/store/utility";


export default defineComponent({
  name: "Studies",

  async setup() {
    const studyStore = useStudies()
    const uncompletedStudies = computed(() => studyStore.getUncompleted())
    const completedStudies = computed(() => studyStore.getCompleted())
    const authStore = useAuth()
    const userStore = useUser()
    const utilityStore = useUtility()

    return { studyStore, uncompletedStudies, completedStudies, authStore, userStore, utilityStore }
  },

  components: {
    PlusIcon
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.uuid = this.userStore.userId
    this.getStudies()

    if (this.$route.query.accessGranted) {
      this.accessGranted = true
      this.$router.replace({
        path: this.$route.path,
        query: {}
      })
    }
  },

  computed: {
    viewStudies() {
      return ['toolbox-studies', 'toolbox-studies-completed'].includes(this.$route.name)
    }
  },

  watch: {
    $route (to, from) {
      if (from.name === 'toolbox-studies-study-summary')
        this.tabConfig.activeTab = 'COMPLETED'

      if (to.name === 'toolbox-studies')
        this.tabConfig.activeTab = 'IN PROGRESS'
    }
  },

  data() {
    return {
      domain: useRuntimeConfig().DOMAIN,
      token: '',
      uuid: '',
      pageDetails: {
        title: 'Studies',
        subtitle: 'TOOLBOX',
        returnPath: '/toolbox',
        logCode: 145,
        logSource: 'Studies',
        logTo: 'Toolbox'
      },
      accessGranted: false,
      tabConfig: {
        activeTab: this.$route.name === 'toolbox-studies-completed' ? 'COMPLETED' : 'IN PROGRESS',
        tabs: [
          { name: 'IN PROGRESS', path: `/toolbox/studies` },
          { name: 'COMPLETED', path: `/toolbox/studies/completed` }
        ]
      }
    }
  },

  methods: {
    async getStudies(): Promise<void> {
      const response = await fetch(this.domain + '/api/studies-read', {
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
      this.utilityStore.logUserActivity(142, "Studies Page (Tools)", "INFO", `User clicked on the "${newTab}" studies tab.`)
    }
  }
})
</script>