<template>
  <div>
    <div v-if="[tabConfig.tabs[0].path, tabConfig.tabs[1].path].includes($route.path)" class="flex-1 flex flex-col">
      <div class="flex justify-between mb-5">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <div class="flex mr-1 gap-x-3">
          <NuxtLink :to="{ path: `/portfolios/${$route.params.portfolio}/holdings/${holdingId}/transactions/new` }">
            <PlusIcon class="h-8 w-8" />
          </NuxtLink>
          <NuxtLink :to="{ path: `/portfolios/${$route.params.portfolio}/holdings/${holdingId}/update` }" class="my-auto">
            <PencilIcon class="h-6 w-6" />
          </NuxtLink>
        </div>
      </div>
      <NavigationTabs :tabConfig="tabConfig" />
      <NuxtPage :transactions="transactions" />
    </div>
    <NuxtPage v-else class="grow"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PencilIcon } from "@heroicons/vue/outline";
import { PlusIcon } from "@heroicons/vue/solid";

export default defineComponent({
  name: "Portfolio Holdings",

  components: {
    PencilIcon, PlusIcon
  },

  mounted() {
    this.getTransactions()
  },

  data() {
    return {
      holdingId: this.$route.params.holding,
      pageDetails: {
        title: this.$route.params.holdingName,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      tabConfig: {
        activeTab: this.$route.path.split('/')[5] || 'TRANSACTIONS',
        tabs: [
          { name: 'TRANSACTIONS', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}` },
          { name: 'CHART', path: `/portfolios/${this.$route.params.portfolio}/holdings/${this.$route.params.holding}/chart` }
        ]
      },
      transactions: null as ([] | null)
    }
  },

  methods: {
    async getTransactions(): Promise<void> {
      const response = await fetch('/api/transactions-read', {
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
        .then(response => response.json())
      this.transactions = response.data
      if (response.data.length > 0)
        this.pageDetails.title = response.data[0].name
    }
  }
})
</script>