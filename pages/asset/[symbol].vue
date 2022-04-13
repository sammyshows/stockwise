<template>
  <NuxtLayout name="page-container">
    <div class="flex justify-between mb-5">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <h2 class="mb-5 my-auto text-lg text-cyan-300">{{ quote["01. symbol"] }}</h2>
    </div>
    <NavigationTabs :tabConfig="tabConfig" />
    <NuxtPage :companyOverview="companyOverview" :quote="quote" />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface StringObject {
  [index: string]: string;
}

export default defineComponent({
  name: "Asset Detail",

  mounted() {
    this.fetchQuote()
    this.fetchOverview()
  },

  data() {
    return {
      pageDetails: {
        title: '',
        returnPath: "/search",
      },
      symbol: this.$route.params.symbol,
      tabConfig: {
        activeTab: 'SUMMARY',
        tabs: [
          {name: 'SUMMARY', path: `/asset/${this.$route.params.symbol}/summary`},
          {name: 'CHART', path: `/asset/${this.$route.params.symbol}/chart`}
        ]
      },
      companyOverview: {},
      quote: {} as StringObject
    }
  },

  watch: {
    'companyOverview.Name'(newName) {
      this.pageDetails.title = newName
    }
  },

  methods: {
    async fetchQuote(): Promise<void> {
      const response = await fetch('/api/stock-quote', {
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
          .then(response => response.json())

      this.quote = response["data"]
    },

    async fetchOverview(): Promise<void> {
      const response = await fetch('/api/stock-overview', {
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
          .then(response => response.json())

      this.companyOverview = response["data"]
    }
  }
})
</script>