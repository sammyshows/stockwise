<template>
  <div class="flex flex-col justify-between h-full">
    <div v-if="viewToolbox" class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
      </div>

      <div class="flex flex-col overflow-scroll grow px-3 divide-y divide-opaque-cyan">
        <div v-for="tool in tools" :key="tool.name">
          <NuxtLink :to="{ name: tool.pathname }" @click="logNavigation(tool.name)" style="touch-action: manipulation">
            <div class="flex justify-end py-3">
              <div class="flex flex-col justify-around grow truncate">
                <div class="flex items-center">
                  <IconsStar v-if="tool.premium" class="h-3.5 w-3.5 mr-1.5 text-bright-cyan" />
                  <h2 class="text-bright-cyan font-medium tracking-wider truncate">{{ tool.name }}</h2>
                </div>
                <p class="font-light text-tiny my-0.5 text-gray-200 truncate">{{ tool.description }}</p>
              </div>
              <div v-if="!tool.hasChildren" class="w-12">
                <IconsRightArrow class="w-8 h-8 ml-auto" />
              </div>
            </div>
          </NuxtLink>
        </div>

      </div>
    </div>
    <NuxtPage v-else/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";


export default defineComponent({
  name: "Toolbox",

  async setup() {
    const authStore = useAuth()
    const userStore = useUser()
    return { authStore, userStore }
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.uuid = this.userStore.userId
  },

  computed: {
    viewToolbox() {
      return this.$route.name === 'toolbox'
    }
  },

  data() {
    return {
      token: '',
      uuid: '',
      pageDetails: {
        title: 'Toolbox'
      },
      tools: [
        { name: 'Stock Questionaire', pathname: 'toolbox-studies', premium: false, hasChildren: false, description: 'Evaluate a stock by answering a series of questions.' },
        { name: 'Currency Converter', pathname: 'toolbox-currency-converter', premium: false, hasChildren: false, description: 'Compare values in different currencies.' },
        { name: 'Growth Calculator', pathname: 'toolbox-growth-calculator', premium: true, hasChildren: false, description: 'Estimate potential future returns.' }
      ]
    }
  },

  methods: {
    logNavigation() {
      console.log('Need log here...')
    }
  }
})
</script>