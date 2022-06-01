<template>
  <div class="h-full flex flex-col">
    <div class="flex flex-col grow px-5">
      <div class="relative mb-3">
        <input @keyup="fetchSearch($event.target.value)" autocomplete="off" type="text" name="search" placeholder="Find your stock..." class="placeholder:text-sm placeholder:italic focus:ring-0 focus:border-white block bg-gray-500/20 w-full border-gray-600 rounded-md" />
        <div v-if="searchResults.length !== 0" class="absolute max-h-64 w-full overflow-scroll mt-0.5 divide-y divide-gray-700 bg-gray-600 border border-t-0 border-gray-600 rounded-b-lg z-10">
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
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <div class="h-0 px-2 flex flex-col grow overflow-scroll gap-y-4 text-sm">
          <div>
            <label for="type" class="flex items-end">Transaction type<span :class="[ invalidType ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <select v-model="transaction.type" id="type" :class="[ invalidType ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
              <option value="" disabled selected hidden></option>
              <option :value="0">BUY</option>
              <option :value="1">SELL</option>
            </select>
          </div>
          <div>
            <label for="quantity" class="flex items-end">Shares<span :class="[ invalidShares ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transaction.quantity" id="quantity" type="number" :class="[ invalidShares ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div>
            <label for="initialPrice" class="flex items-end">Price per share<span :class="[ invalidPrice ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transaction.initialPrice" id="initialPrice" type="number" :class="[ invalidPrice ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div>
            <label for="exchangeRate" class="flex items-end">Exchange rate<span :class="[ invalidExchange ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
            <input v-model="transaction.exchangeRate" id="exchangeRate" type="number" :class="[ invalidExchange ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div class="w-full flex justify-around gap-x-4">
            <div>
              <label for="date">Date</label>
              <input v-model="transaction.date" id="date" type="date" class="box-border bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-white" />
            </div>
            <div>
              <label for="time">Time</label>
              <input v-model="transaction.time" id="time" type="time" class="box-border bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-white" />
            </div>
          </div>
        </div>
        <div class="text-right mb-7">
          <ButtonsCyan text="SAVE" @clicked="addHolding()" />
        </div>
      </div>
    </div>
    <!--  this div below is used to "close" the search results box when a user clicks away  -->
    <div v-if="searchResults.length !== 0" @click="clearSearchResults" class="absolute top-0 left-0 bottom-14 right-0"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "New Stock",

  setup() {
    const token = useState('authToken').value
    return { token }
  },

  mounted() {
    this.setDateTime()
  },

  data() {
    return {
      portfolioId: this.$route.params.portfolio,
      searchResults: [],
      quote: null as ({} | null),
      invalidStock: false,
      invalidType: false,
      invalidShares: false,
      invalidPrice: false,
      invalidExchange: false,
      transaction: {
        type: '',
        quantity: null as (number | null),
        initialPrice: null as (number | null),
        exchangeRate: null as (number | null),
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    async fetchSearch(searchTerm: string): Promise<void> {
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
    },

    async fetchQuote(symbol: string): Promise<void> {
      this.searchResults = []
      this.quote = {}
      const quote = await fetch('/api/stock-quote', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
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

    setDateTime(): void {
      const date = new Date()

      // Create the date format
      const dd = String(date.getDate()).padStart(2, '0')
      const MM = String(date.getMonth() + 1).padStart(2, '0')
      const yyyy = date.getFullYear()

      // Create the time format
      const mm = String(date.getMinutes()).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')

      this.transaction.date = yyyy + '-' + MM + '-' + dd
      this.transaction.time = hh + ':' + mm
    },

    parseDate() {
      const date = new Date(this.transaction.date + 'T' + this.transaction.time)
      return date.toISOString()
    },

    async addHolding(): Promise<void> {
      const holdingId = await fetch('/api/holding-create', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          token: this.token,
          portfolio: this.portfolioId,
          symbol: this.quote.symbol,
          quantity: this.transaction.quantity,
          initialValue: this.transaction.initialPrice * this.transaction.quantity
        })
      })
        .then(response => response.json())
        .then(data => data.holdingId)

      await this.addTransaction(holdingId)
    },

    async addTransaction(holdingId): Promise<void> {
      await fetch('/api/transaction-create', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: holdingId,
          type: this.transaction.type,
          quantity: this.transaction.quantity,
          initialPrice: this.transaction.initialPrice,
          exchangeRate: this.transaction.exchangeRate,
          timestamp: this.parseDate()
        })
      })
        .then(this.$router.push({name: 'portfolios-portfolio-holdings-holding',
          params: {
            portfolio: this.portfolioId,
            holding: holdingId,
            assetSymbol: this.quote.symbol + ' : ' + this.quote.primaryExchange,
            assetName: this.quote.companyName
          }
        }))
    }
  }
})
</script>
