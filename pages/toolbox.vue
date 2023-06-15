<template>
  <div class="flex flex-col justify-between h-full">
    <div v-if="viewToolbox" class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
      </div>

      <div class="flex flex-col overflow-scroll grow px-3 divide-y divide-opaque-cyan">
        <div v-for="tool in tools" :key="tool.name">
          <div @click="handleToolClick(tool); logNavigation(tool.name)" style="touch-action: manipulation">
            <div class="flex justify-end py-3">
              <div class="flex flex-col justify-around grow truncate">
                <div class="flex items-center">
                  <IconsStar v-if="tool.premium" class="h-3.5 w-3.5 mr-1.5 text-bright-cyan" />
                  <h2 :class="{ 'text-bright-cyan': tool.premium }" class="font-medium tracking-wider truncate">{{ tool.name }}</h2>
                </div>
                <p class="font-light text-tiny my-0.5 text-gray-300 truncate">{{ tool.description }}</p>
              </div>
              <div v-if="!tool.hasChildren" class="w-12">
                <IconsRightArrow class="w-8 h-8 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <NuxtPage v-else />

    <RewardModal :open="showRewardModal"
                 @watchRewardAd="watchRewardAd"
                 @close="closeRewardModal"
                 :title="currentTool?.name"
                 message="This is a premium feature, watch an ad to gain access." />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { storeToRefs } from 'pinia'
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { useAds } from '@/store/ads'
import { useUtility } from '@/store/utility'


export default defineComponent({
  name: "Toolbox",

  async setup() {
    const authStore = useAuth()
    const userStore = useUser()
    const adStore = useAds()
    const utilityStore = useUtility()
    const { showRewardModal, rewardAdLoaded, permittedContent } = storeToRefs(adStore)

    return { authStore, userStore, adStore, utilityStore, showRewardModal, rewardAdLoaded, permittedContent }
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.uuid = this.userStore.userId
  },

  data() {
    return {
      token: '',
      uuid: '',
      pageDetails: {
        title: 'Toolbox'
      },
      currentTool: null as ({} | null),
      tools: [
        { name: 'Currency Converter', path: '/toolbox/currency-converter', premium: false, hasChildren: false, description: 'Compare values in different currencies.' },
        { name: 'Stock Questionnaire', path: '/toolbox/studies', premium: true, hasChildren: false, description: 'Evaluate a stock by answering a series of questions.' },
        { name: 'Growth Calculator', path: '/toolbox/growth-calculator', premium: true, hasChildren: false, description: 'Estimate potential future returns.' }
      ]
    }
  },

  computed: {
    viewToolbox() {
      return this.$route.name === 'toolbox'
    },

    permittedTools() {
      return this.permittedContent.map((content) => content.name)
    }
  },

  methods: {
    handleToolClick(tool) {
      if (tool.premium && this.rewardAdLoaded && !this.isToolAccessValid(tool)) { // Production
      // if (tool.premium && !this.isToolAccessValid(tool)) { // Web Testing
        this.currentTool = tool
        this.adStore.$patch({ showRewardModal: true })
        this.logEvent(604, "Toolbox", `Opening Reward Ad Modal. Tool name: "${tool.name}"`)
      } else {
        this.$router.push(tool.path)
        this.logEvent(144, "Toolbox", `User navigated to the "${tool.name}" tool.`)
      }
    },

    isToolAccessValid(tool) {
      let toolPermit = this.permittedContent.find(content => content.type === 'tool' && content.name === tool.name)

      if (!this.permittedTools.includes(tool.name))
        return false
      else if (toolPermit && (toolPermit.accessTimestamp / 1000) < (Date.now() / 1000 - 43200)) { // access expires after 12 hours... or 43200 seconds...
        this.adStore.$patch({ permittedContent: this.permittedContent.filter((content) => content != toolPermit) }) // remove it from the permittedContent array...
        this.logEvent(713, "Toolbox", `Tool access has expired. Tool name: "${tool.name}"`)
        return false
      } else {
        this.logEvent(714, "Toolbox", `Tool access is valid. Tool name: "${tool.name}"`)
        return true
      }
    },

    watchRewardAd() {
      this.adStore.showRewardAd({
        name: this.currentTool.name,
        path: this.currentTool.path,
        type: "tool",
        accessTimestamp: Date.now()
      })

      this.closeRewardModal()
    },

    closeRewardModal() {
      this.adStore.$patch({ showRewardModal: false })
      this.logEvent(605, "Reward Ad Modal", `closeRewardModal function is called.`)
    },

    logEvent(code, source, message) {
      this.utilityStore.logUserActivity(code, source, "INFO", message)
    }
  }
})
</script>