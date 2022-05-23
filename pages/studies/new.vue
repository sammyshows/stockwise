<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between mb-10">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div class="flex flex-col justify-between grow px-5">
      <div class="flex flex-col">
        <p>
          Study a company by answering a series of questions about the company's performance in different areas.

        </p>
        <div class="relative mb-3">
          <input @keyup="fetchSearch($event.target.value)" autocomplete="off" type="text" name="search" placeholder="Find your stock..." class="placeholder:text-sm placeholder:text-gray-400 placeholder:italic focus:ring-0 focus:border-white block bg-gray-500/20 w-full border-gray-600 rounded-md" />
          <div v-if="searchResults.length !== 0" class="absolute max-h-64 w-full overflow-scroll mt-0.5 divide-y divide-gray-700 bg-gray-700 border border-t-0 border-gray-600 rounded-b-lg z-10">
            <div v-for="result in searchResults" @click="fetchQuote(result.symbol)" class="flex justify-between items-center h-10 w-full px-3 gap-x-3">
              <p class="w-2/5 whitespace-nowrap">{{ result.symbol + " : " + result.exchange }}</p>
              <p class="w-2/5 text-right truncate">{{ result.securityName }}</p>
            </div>
          </div>
        </div>
        <div v-if="quote" class="h-20 px-3">
          <p class="text-center truncate">{{ quote.companyName }}</p>
          <div v-if="Object.keys(quote).length !== 0" class="flex text-xs">
            <div class="w-1 grow text-right">
              <p class="truncate">{{ quote.symbol }}</p>
              <p class="truncate">Current price</p>
              <p class="truncate">Daily movement</p>
            </div>
            <div class="w-3 text-center">
              <p>:</p>
              <p>:</p>
              <p>:</p>
            </div>
            <div class="w-1 grow">
              <p class="truncate">{{ quote.primaryExchange }}</p>
              <p class="truncate">{{ quote.latestPrice }}</p>
              <p class="truncate" :class="{ 'text-bright-red': quote.change < 0, 'text-bright-green': quote.change > 0 }">{{ $addSign($formatNumber(quote.change, 2)) }} ({{ $addSign($formatNumber(quote.changePercent * 100), 2) }}%)</p>
            </div>
          </div>
          <Spinner v-else />
        </div>

        <div class="mt-5 text-sm">
          <label for="type" class="flex items-end">Study type</label>
          <select v-model="studyType" id="type" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
            <option value="" disabled selected hidden></option>
            <option :value="0">Standard</option>
            <option :value="1">Advanced</option>
          </select>
        </div>
      </div>
      <div class="text-right mb-7">
        <button @click="addStudy()" class="w-32 h-8 rounded-lg bg-bright-cyan text-black text-xl">CREATE</button>
      </div>
    </div>
    <!--  this div below is used to "close" the search results box when a user clicks away  -->
    <div v-if="searchResults.length !== 0" @click="clearSearchResults" class="absolute top-0 left-0 bottom-14 right-0"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "New Study",

  mounted() {
    if (this.$route.params.assetSymbol)
      this.fetchQuote(this.$route.params.assetSymbol)
  },

  data() {
    return {
      pageDetails: {
        returnPath: '/studies',
        title: 'Start a Study'
      },
      searchResults: [],
      quote: null as ({} | null),
      studyType: 0
    }
  },

  methods: {
    async fetchSearch(searchTerm: string): Promise<void> {
      const data = await fetch('/api/stock-search', {
        method: 'POST',
        body: JSON.stringify({
          searchTerm: searchTerm
        })
      })
        .then(response => response.json())

      this.searchResults = data.data.slice(0,10)
    },

    async fetchQuote(symbol: string): Promise<void> {
      this.searchResults = []
      this.quote = {}
      const quote = await fetch('/api/stock-quote', {
        method: 'POST',
        body: JSON.stringify({
          symbol: symbol
        })
      })
          .then(response => response.json())
      this.quote = quote.data
    },

    clearSearchResults(): void {
      this.searchResults = []
    },

    async addStudy(): Promise<void> {
      await fetch('/api/study-create', {
        method: 'POST',
        body: JSON.stringify({
          userId: 1,
          symbol: this.quote.symbol,
          type: this.studyType
        })
      })
        .then(response => response.json())
        .then(data => this.$router.push({name: 'studies-study',
          params: {
            study: data.studyId
          }
        }))

    }
  }
})
</script>
