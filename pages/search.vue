<template>
  <NuxtLayout name="page-container" activeButton="search">
    <div v-if="$route.path === '/search'">
      <div class="h-14 mb-5 px-3">
        <PageTitle :pageDetails="pageDetails" class="min-h-min mb-4" />
      </div>

      <div class="px-5">
        <div class="relative mb-3">
          <div class="absolute inset-y-0 left-0 px-3 flex items-center pointer-events-none text-gray-600">
            <SearchIcon class="h-7 w-7" aria-hidden="true" />
          </div>
          <input @keyup="fetchSearch($event.target.value)" autocomplete="off" type="text" name="search" placeholder="Search for a company..." class="placeholder:text-sm placeholder:text-gray-600 placeholder:italic focus:ring-0 focus:border-white block bg-gray-900/20 w-full pl-12 border-gray-400/40 rounded-lg" />
          <div v-if="searchResults.length !== 0" class="absolute max-h-64 w-full overflow-scroll mt-0.5 divide-y divide-gray-700 bg-gray-600 border border-t-0 border-gray-600 rounded-b-lg z-10">
            <NuxtLink v-for="result in searchResults" @click="clearSearchResults(); setSearches(result);" :to="{ name: 'search-symbol', params: { symbol: result.symbol, assetSymbol: result.symbol, assetName: result.securityName } }" class="flex justify-between items-center h-10 w-full px-3 gap-x-3">
              <p class="w-2/5 whitespace-nowrap">{{ result.symbol + " : " + result.exchange }}</p>
              <p class="w-2/5 text-right truncate">{{ result.securityName }}</p>
            </NuxtLink>
          </div>
        </div>

        <div v-if="searchResults.length === 0">
          <h2 class="py-2 border-b-4 border-gray-400 w-max font-medium text-gray-400">Recent</h2>

          <div class="mt-2 divide-y divide-gray-300/20">
            <NuxtLink v-for="asset in recentSearches" @click="setSearches(asset)" :to="{ name: 'search-symbol', params: { symbol: asset.symbol, assetSymbol: asset.symbol, assetName: asset.name } }" class="w-full flex justify-between p-2">
              <div class="flex">
                <p class="w-20 my-auto text-xs truncate">{{ asset.symbol + " : " + asset.exchange }}</p>
                <p class="w-44 my-auto ml-3 text-xs truncate">{{ asset.securityName }}</p>
              </div>
              <ArrowNarrowRightIcon class="h-6 w-6" />
            </NuxtLink>
          </div>
        </div>
      </div>
      <!--  this div below is used to "close" the search results box when a user clicks away  -->
      <div v-if="searchResults.length !== 0" @click="clearSearchResults" class="absolute top-0 left-0 bottom-14 right-0"></div>
    </div>
    <NuxtPage v-else />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { SearchIcon } from '@heroicons/vue/solid'
import { ArrowNarrowRightIcon } from '@heroicons/vue/outline'

export default defineComponent({
  name: "Search",

  async setup() {
    const token = await useState('authToken').value
    return { token }
  },

  components: {
    SearchIcon, ArrowNarrowRightIcon
  },

  mounted() {
    this.getSearches()
  },

  data() {
    return {
      pageDetails: {
        title: "Search",
      },
      recentSearches: [],
      searchResults: [],
    }
  },

  methods: {
    async fetchSearch(searchTerm: string): Promise<void> {
      if (searchTerm !== '') {
        const data = await fetch('/api/stock-search', {
          headers: {
            authorization: 'Bearer ' + this.token
          },
          method: 'POST',
          body: JSON.stringify({
            searchTerm: searchTerm
          })
        })
          .then(response => response.json())

        this.searchResults = data.data.slice(0,10)
      }
    },

    clearSearchResults() {
      this.searchResults = []
    },

    getSearches() {
      if (localStorage.getItem('recentSearches'))
        this.recentSearches = JSON.parse(localStorage.getItem('recentSearches'))
    },

    setSearches(asset) {
      const search = { securityName: asset.securityName, symbol: asset.symbol, exchange: asset.exchange }
      let searches = this.recentSearches

      searches = searches.filter(s => s.symbol !== search.symbol )

      if (this.recentSearches.length > 4)
        searches = searches.slice(0, 4)

      searches.unshift(search)

      this.recentSearches = searches
      localStorage.setItem('recentSearches', JSON.stringify(searches))
    }
  }
})
</script>

<style scoped>

</style>
