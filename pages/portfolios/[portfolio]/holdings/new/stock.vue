<template>
  <div class="h-full flex flex-col">
    <div class="flex flex-col grow px-5">
      <div class="relative">
        <input @keyup="" type="text" name="search" placeholder="Find your stock" class="focus:ring-0 focus:border-white block bg-gray-900 w-full text-xs border-gray-600 rounded-md" />
        <div class="absolute max-h-48 w-full overflow-scroll mt-0.5 divide-y divide-bright-cyan bg-opaque-cyan backdrop-blur-3xl rounded-b-lg">
          <div v-for="result in searchResults" class="flex justify-between items-center h-10 w-full px-3 gap-x-3">
            <p class="w-2/5">{{ result.symbol + " : " + result.exchange }}</p>
            <p class="w-2/5 text-right truncate">{{ result.securityName }}</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col justify-between items-center w-full mt-3 mb-5 px-3 gap-x-3">
        <p class="w-full text-lg truncate">International Business Machines Corporation</p>
        <p class="text-xs">IBM : NAS</p>
        <p class="text-xs">Current price: <span>126.56</span></p>
        <p class="text-xs">Daily movement: <span class="text-bright-green">6.21 (4.98%)</span></p>
      </div>
      <div class="flex flex-col grow justify-between mt-3">
        <div class="flex flex-col grow gap-y-4 text-sm">
          <div>
            <label for="type" class="flex items-end">Transaction Type<span :class="[ invalidType ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <select v-model="transactionDetails.type" id="type" :class="[ invalidType ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <label for="included" class="flex items-end">Shares<span :class="[ invalidShares ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transactionDetails.shares" id="included" type="number" :class="[ invalidShares ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div>
            <label for="included" class="flex items-end">Exchange Rate<span :class="[ invalidExchange ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transactionDetails.shares" id="exchangeRate" type="number" :class="[ invalidExchange ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
        </div>
        <div class="text-right mb-14">
          <button @click="addHolding()" class="w-28 h-10 rounded-lg bg-bright-green text-black text-xl">SAVE</button>
        </div>
      </div>
    </div>
    <!--  this div below is used to "close" the search results box when a user clicks away  -->
    <div v-if="searchResults.length !== 0" @click="clearSearchResults" class="absolute top-0 left-0 bottom-14 right-0"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SearchIcon } from '@heroicons/vue/solid'

export default defineComponent({
  name: "New Stock",

  components: {
    SearchIcon
  },

  data() {
    return {
      searchResults: [
        // { symbol: "TSLA", exchange: "NAS", securityName: "Tesla Inc" },
        // { symbol: "TSLA-SE", exchange: "SWX", securityName: "" },
        // { symbol: "TSLX", exchange: "NYS", securityName: "Sixth Street Specialty Lending Inc" },
        // { symbol: "TSLA-SE", exchange: "SWX", securityName: "" },
        // { symbol: "TSLX", exchange: "NYS", securityName: "Sixth Street Specialty Lending Inc" }
      ],
      invalidType: false,
      invalidShares: false,
      invalidExchange: false,
      holdingDetails: {
        symbol: ''
      },
      transactionDetails: {
        type: '',
        shares: null as (number | null),
        price: 0
      }
    }
  },

  methods: {
    clearSearchResults(): void {
      this.searchResults = []
    },

    addHolding(): void {

    }
  }
})
</script>