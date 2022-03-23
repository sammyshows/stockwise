<template>
  <PageContainer>
    <PageTitle :pageDetails="pageDetails" />

    <div class="mt-1 relative rounded shadow-sm mb-5">
      <div class="absolute inset-y-0 left-0 px-3 flex items-center pointer-events-none">
        <SearchIcon class="h-7 w-7" aria-hidden="true" />
      </div>
      <input @keyup.enter="fetchSearch($event.target.value)" type="text" name="search" placeholder="Search" class="focus:ring-indigo-500 focus:border-indigo-500 block bg-gray-900 w-full pl-12 text-xs border-gray-600 rounded-md" />
    </div>

    <div v-if="searchResults.length > 0">
      <h2 class="mb-3 py-2 border-b-4 border-white w-max font-medium">SEARCH RESULTS</h2>
      <div class="flex justify-between px-1 py-2">
        <p class="text-xs font-medium">NAME</p>
        <p class="text-xs font-medium">TICKER</p>
      </div>
      <NuxtLink v-for="result in searchResults" :to="{ name: 'asset-symbol-summary', params: { symbol: result.symbol } }" class="flex justify-between items-center px-1 py-2 border-t border-white hover:bg-gray-700 duration-300 gap-x-10">
        <p class="text-xs truncate">{{ result.name }}</p>
        <p class="text-bright-cyan">{{ result.symbol }}</p>
      </NuxtLink>
    </div>

    <div v-else>
      <h2 class="py-2 border-b-4 border-white w-max font-medium">Recent</h2>
    </div>
  </PageContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import PageContainer from "../components/PageContainer.vue"
import PageTitle from "../components/PageTitle.vue"
import { SearchIcon } from '@heroicons/vue/solid'

export default defineComponent({
  name: "Search",

  components: {
    PageContainer, PageTitle, SearchIcon
  },

  data() {
    return {
      pageDetails: {
        title: "Search",
      },
      searchResults: [] as Array<{}>,
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

      this.sortResults(data["data"]["bestMatches"])
    },

    sortResults(data): void {
      const results = data.slice(0, 5)
      results.forEach((result: any) => {
        const searchResult = {
          name: result["2. name"],
          symbol: result["1. symbol"]
        }
        this.searchResults.push(searchResult)
      })
      console.log(this.searchResults)
    }
  }
})
</script>

<style scoped>

</style>
