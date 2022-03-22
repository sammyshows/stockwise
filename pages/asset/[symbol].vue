<template>
  <PageContainer>
    <div class="flex justify-between">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <h2 class="mb-5 my-auto text-lg text-cyan-300">{{ quote["01. symbol"] }}</h2>
    </div>
    <NavigationTabs :tabs="tabs" />
    <NuxtPage :companyOverview="companyOverview" :quote="quote" />
  </PageContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface StringObject {
  [index: string]: string;
}

export default defineComponent({
  name: "Asset Detail",

  created() {
    this.fetchOverview()
    this.fetchQuote()
  },

  data() {
    return {
      pageDetails: {
        title: '',
        returnPath: "/search"
      },

      tabs: [
        { name: 'SUMMARY', path: '/search/code/summary' },
        { name: 'CHART', path: '/search/code/chart' }
      ],

      symbol: window.location.pathname.split('/')[2],
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
    async fetchQuote() {
      const response = await fetch('/api/stock-quote', {
        method: 'POST',
        body: JSON.stringify({
          symbol: "AAPL"
        })
      })
          .then(response => response.json())

      this.price = response["data"]
    },

    async fetchOverview() {
      const response = await fetch('/api/stock-overview', {
        method: 'POST',
        body: JSON.stringify({
          symbol: "AAPL"
        })
      })
          .then(response => response.json())

      this.price = response["data"]
    }
  }
})
</script>