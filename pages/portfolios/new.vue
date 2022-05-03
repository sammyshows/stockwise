<template>
  <div class="h-full flex flex-col px-3">
    <div class="flex justify-between mb-14">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div class="flex flex-col grow justify-between px-6">
      <div class="flex flex-col grow gap-y-6 text-sm">
        <div>
          <label for="name" class="flex items-end">Portfolio name<span :class="[ invalidName ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
          <input @click="invalidName = false" v-model="portfolioDetails.name" autocomplete="off" id="name" type="text" :class="[ invalidName ? 'border-red-600' : 'border-gray-600' ]" class="w-full py-4 h-8 bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm" autofocus>
        </div>
        <div class="flex justify-between">
          <label for="included" class="flex items-center">Included in totals</label>
          <input v-model="portfolioDetails.included" id="included" type="checkbox" class="w-6 h-6 my-auto text-bright-green bg-transparent rounded-sm duration-100 focus:ring-offset-0 focus:ring-0">
        </div>
      </div>
      <div class="text-right mb-7">
        <button @click="createPortfolio()" class="w-28 h-10 rounded-lg bg-bright-green text-black text-xl">SAVE</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "New",

  data() {
    return {
      pageDetails: {
        title: 'New Portfolio',
        returnPath: '/portfolios'
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
        await fetch('/api/portfolio-create', {
          method: 'POST',
          body: JSON.stringify(this.portfolioDetails)
        })
          .then(this.$router.push("/overview"))
      }
    }
  }
})
</script>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:focus {
  transition: background-color 600000s 0s, color 600000s 0s;
}
input[data-autocompleted] {
  background-color: transparent !important;
}
</style>