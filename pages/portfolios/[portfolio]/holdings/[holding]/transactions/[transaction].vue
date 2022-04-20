<template>
  <div class="flex flex-col grow">
    <div class="flex justify-between mb-14">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <TrashIcon @click="this.openModal = true" class="h-6 w-6 mr-3" />
    </div>
<!--    <div class="flex flex-col grow px-5">-->
<!--      <div class="relative mb-3">-->
<!--        <input @keyup="fetchSearch($event.target.value)" autocomplete="off" type="text" name="search" placeholder="Find your stock..." class="placeholder:text-sm placeholder:italic focus:ring-0 focus:border-white block bg-gray-900 w-full border-gray-600 rounded-md" />-->
<!--        <div v-if="searchResults.length !== 0" class="absolute max-h-64 w-full overflow-scroll mt-0.5 divide-y divide-bright-cyan bg-gray-800 border border-t-0 border-gray-600 rounded-b-lg z-10">-->
<!--          <div v-for="result in searchResults" @click="fetchQuote(result.symbol)" class="flex justify-between items-center h-10 w-full px-3 gap-x-3">-->
<!--            <p class="w-2/5 whitespace-nowrap">{{ result.symbol + " : " + result.exchange }}</p>-->
<!--            <p class="w-2/5 text-right truncate">{{ result.securityName }}</p>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div v-if="quote" class="h-20 px-3">-->
<!--        <p class="text-center truncate">{{ quote.companyName }}</p>-->
<!--        <div v-if="Object.keys(quote).length !== 0" class="flex text-xs">-->
<!--          <div class="w-1 grow text-right">-->
<!--            <p class="truncate">{{ quote.symbol }}</p>-->
<!--            <p class="truncate">Current price</p>-->
<!--            <p class="truncate">Daily movement</p>-->
<!--          </div>-->
<!--          <div class="w-3 text-center">-->
<!--            <p>:</p>-->
<!--            <p>:</p>-->
<!--            <p>:</p>-->
<!--          </div>-->
<!--          <div class="w-1 grow">-->
<!--            <p class="truncate">{{ quote.primaryExchange }}</p>-->
<!--            <p class="truncate">{{ quote.latestPrice }}</p>-->
<!--            <p class="text-bright-green truncate">{{ quote.change }} ({{ (quote.changePercent * 100).toFixed(2) }}%)</p>-->
<!--          </div>-->
<!--        </div>-->
<!--        <Spinner v-else />-->
<!--      </div>-->
<!--      <div class="flex flex-col grow justify-between gap-y-4 mt-3">-->
<!--        <div class="h-0 flex flex-col grow overflow-scroll gap-y-4 text-sm">-->
<!--          <div>-->
<!--            <label for="type" class="flex items-end">Transaction type<span :class="[ invalidType ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>-->
<!--            <select v-model="transactionDetails.type" id="type" :class="[ invalidType ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">-->
<!--              <option value="" disabled selected hidden></option>-->
<!--              <option value="BUY">BUY</option>-->
<!--              <option value="SELL">SELL</option>-->
<!--            </select>-->
<!--          </div>-->
<!--          <div>-->
<!--            <label for="shares" class="flex items-end">Shares<span :class="[ invalidShares ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>-->
<!--            <input v-model="transactionDetails.shares" id="shares" type="number" :class="[ invalidShares ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">-->
<!--          </div>-->
<!--          <div>-->
<!--            <label for="price" class="flex items-end">Price per share<span :class="[ invalidPrice ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>-->
<!--            <input v-model="transactionDetails.price" id="price" type="number" :class="[ invalidPrice ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">-->
<!--          </div>-->
<!--          <div>-->
<!--            <label for="exchangeRate" class="flex items-end">Exchange rate<span :class="[ invalidExchange ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>-->
<!--            <input v-model="transactionDetails.exchange" id="exchangeRate" type="number" :class="[ invalidExchange ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="text-right mb-7">-->
<!--          <button @click="addHolding()" class="w-28 h-10 rounded-lg bg-bright-green text-black text-xl">SAVE</button>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TrashIcon } from "@heroicons/vue/outline";

export default defineComponent({
  name: "Portfolio Holdings",

  components: {
    TrashIcon
  },

  mounted() {
    this.getTransaction()
  },

  watch: {
    $route (to, from){
      if (from.name === 'portfolios-portfolio-holdings-holding-update')
        this.tabConfig.activeTab = 'TRANSACTIONS'
    }
  },

  data() {
    return {
      holdingId: this.$route.params.holding,
      pageDetails: {
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      transaction: {},
      openModal: false
    }
  },

  methods: {
    async getTransaction(): Promise<void> {
      const response = await fetch('/api/transactions-read', {
        method: 'POST',
        body: JSON.stringify({
          holdingId: this.holdingId
        })
      })
          .then(response => response.json())
      this.transactions = response.data
      this.pageDetails.title = response.data[0].symbol + " : " + response.data[0].exchange
      this.pageDetails.subtitle = response.data[0].name
    }
  }
})
</script>