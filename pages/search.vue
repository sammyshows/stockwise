<template>
  <NuxtLayout name="page-container" activeButton="search">
    <div class="px-3">
      <PageTitle :pageDetails="pageDetails" class="min-h-min" />

      <div class="relative mb-3">
        <div class="absolute inset-y-0 left-0 px-3 flex items-center pointer-events-none">
          <SearchIcon class="h-7 w-7" aria-hidden="true" />
        </div>
        <input @keyup="fetchSearch($event.target.value)" autocomplete="off" type="text" name="search" placeholder="Search..." class="placeholder:text-sm placeholder:italic focus:ring-0 focus:border-white block bg-gray-900 w-full pl-12 border-gray-600 rounded-md" />
        <div v-if="searchResults.length !== 0" class="absolute max-h-64 w-full overflow-scroll mt-0.5 divide-y divide-bright-cyan bg-gray-800 border border-t-0 border-gray-600 rounded-b-lg z-10">
          <NuxtLink v-for="result in searchResults" :to="{ name: 'asset-symbol-summary', params: { symbol: result.symbol, assetSymbol: result.symbol + ' : ' + result.exchange, assetName: result.securityName } }" class="flex justify-between items-center h-10 w-full px-3 gap-x-3">
            <p class="w-2/5 whitespace-nowrap">{{ result.symbol + " : " + result.exchange }}</p>
            <p class="w-2/5 text-right truncate">{{ result.securityName }}</p>
          </NuxtLink>
        </div>
      </div>

      <div v-if="searchResults.length === 0">
        <h2 class="py-2 border-b-4 border-white w-max font-medium">Recent</h2>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { SearchIcon } from '@heroicons/vue/solid'

export default defineComponent({
  name: "Search",

  components: {
    SearchIcon
  },

  data() {
    return {
      pageDetails: {
        title: "Search",
      },
      searchResults: [],
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
  }
})
</script>

<style scoped>

</style>
