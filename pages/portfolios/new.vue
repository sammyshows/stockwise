<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div class="h-full pb-12 flex flex-col">
      <div class="flex justify-between mb-10">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      </div>

      <div class="flex flex-col grow justify-between px-6">
        <div class="flex flex-col grow gap-y-8">
          <div>
            <label for="name" class="flex items-end mb-4">PORTFOLIO NAME</label>
            <input @click="invalidName = false" v-model="portfolioDetails.name" name="name" id="name" type="text" :class="{ 'border-red-600': invalidName }" class="w-full py-4 h-8 bg-transparent border border-0 border-b border-gray-600 rounded-sm text-white">
          </div>
          <div class="flex justify-between">
            <label for="included" class="flex items-center">INCLUDED IN TOTALS</label>
            <input v-model="portfolioDetails.included" name="included" id="included" type="checkbox" class="w-8 h-8 text-bright-green bg-transparent rounded-sm">
          </div>
        </div>
        <div class="text-right">
          <button @click="createPortfolio()" class="w-28 h-10 rounded-lg bg-bright-green text-black text-xl">SAVE</button>
        </div>
      </div>
    </div>
    <NuxtPage :holdings="holdings" />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Holdings",

  props: ['holdings'],

  data() {
    return {
      pageDetails: {
        title: 'New Portfolio',
        returnPath: '/overview'
      },
      invalidName: false,
      portfolioDetails: {
        userId: 1,    // This will use the userId that will be known throughout the app somehow...
        name: '',
        included: true
      }
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.portfolioDetails.name !== '')
        return true
      else
        this.invalidName = true
    },

    async createPortfolio(): Promise<void> {
      if (this.validateForm()) {
        await fetch('/api/portfolios-create', {
          method: 'POST',
          body: JSON.stringify(this.portfolioDetails)
        })
          .then(this.$router.push("/overview"))
      }
    }
  }
})
</script>