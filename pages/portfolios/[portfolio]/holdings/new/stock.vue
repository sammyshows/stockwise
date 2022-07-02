<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between h-14 mb-5">
      <PageTitle v-if="pageDetails.subtitle" :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div class="flex flex-col grow px-3">
      <div class="flex flex-col grow pb-3">
        <div class="flex flex-col grow justify-between gap-y-4 mt-3">
          <div class="h-0 px-4 flex flex-col grow overflow-scroll gap-y-4 text-sm">
            <TransitionGroup name="form">
              <div key="1" v-if="!manualForm">
                <div class="relative" >
                  <input @keyup="fetchSearch($event.target.value)" autocomplete="off" type="text" name="search" placeholder="Find your stock..." class="placeholder:text-sm placeholder:italic focus:ring-0 focus:border-white block bg-gray-500/20 w-full border-gray-600 rounded-md" />
                  <div v-if="searchResults.length !== 0" class="absolute max-h-64 w-full overflow-scroll mt-0.5 divide-y divide-gray-700 bg-gray-600 border border-t-0 border-gray-600 rounded-b-lg z-10">
                    <div v-for="result in searchResults" @click="fetchQuote(result.symbol)" class="flex justify-between items-center h-10 w-full px-3 gap-x-3">
                      <p class="w-2/5 whitespace-nowrap">{{ result.symbol + " : " + result.exchange }}</p>
                      <p class="w-2/5 text-right truncate">{{ result.securityName }}</p>
                    </div>
                  </div>
                </div>

                <button @click="toggleManual" key="5" class="w-max mt-4 mb-3 px-4 py-1 rounded-lg border border-gray-500 bg-white/10 text-gray-200 text-italic text-xs">Can't find a company?</button>

                <div v-if="quote" class="w-full h-16 px-3 mb-3">
                  <p class="w-full text-center truncate">{{ quote.companyName }}</p>
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
                  <Spinner class="h-16" v-else />
                </div>
              </div>

              <div v-else key="2" class="w-full">
                <p class="mb-2 px-6 text-xs text-center text-gray-400">Use the fields below to manually enter details for your stock:</p>
                <div>
                  <label for="name" class="flex items-end">Name</label>
                  <input v-model="transaction.name" id="name" type="text" autocomplete="off" placeholder="e.g. Microsoft Inc" class="w-full bg-transparent text-white border border-0 border-b placeholder:text-sm placeholder:italic focus:ring-0 focus:border-white text-sm">
                </div>

                <div class="mt-5">
                  <label for="symbol" class="flex items-end">Symbol</label>
                  <input v-model="transaction.symbol" id="symbol" type="text" autocomplete="off" placeholder="e.g. MSFT" class="w-full bg-transparent text-white border border-0 border-b placeholder:text-sm placeholder:italic focus:ring-0 focus:border-white text-sm">
                </div>

                <div class="mt-5">
                  <label for="currentPrice" class="flex items-end">Current price</label>
                  <input v-model="transaction.currentPrice" id="currentPrice" type="text" autocomplete="off" placeholder="e.g. 271.29" class="w-full bg-transparent text-white border border-0 border-b placeholder:text-sm placeholder:italic focus:ring-0 focus:border-white text-sm">
                </div>

                <button @click="toggleManual" key="5" class="w-max mt-4 px-4 py-1 rounded-lg border border-gray-500 bg-white/10 text-gray-200 text-italic text-xs">Search for a company</button>
              </div>

              <div key="3">
                <label for="type" class="flex items-end">Transaction type<span :class="[ invalidType ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
                <select v-model="transaction.type" id="type" :class="[ invalidType ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
                  <option value="" disabled selected hidden></option>
                  <option :value="0">BUY</option>
                  <option :value="1" disabled>SELL</option>
                </select>
              </div>
              <div key="4">
                <label for="quantity" class="flex items-end">Shares<span :class="[ invalidShares ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
                <input v-model="transaction.quantity" id="quantity" type="number" :class="[ invalidShares ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
              </div>
              <div key="5">
                <label for="initialPrice" class="flex items-end">Price per share<span :class="[ invalidPrice ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
                <input v-model="transaction.initialPrice" id="initialPrice" type="number" :class="[ invalidPrice ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
              </div>
              <div key="6">
                <label for="exchangeRate" class="flex items-end">Exchange rate<span :class="[ invalidExchange ? 'text-red-600': 'hidden' ]">&nbsp;&#10033;</span></label>
                <input v-model="transaction.exchangeRate" id="exchangeRate" type="number" :class="[ invalidExchange ? 'border-red-600' : 'border-gray-400' ]" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
              </div>
              <div key="7" class="w-full flex justify-around gap-x-4">
                <div>
                  <label for="date">Date</label>
                  <input v-model="transaction.date" id="date" type="date" class="box-border bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-white" />
                </div>
                <div>
                  <label for="time">Time</label>
                  <input v-model="transaction.time" id="time" type="time" class="box-border bg-transparent text-sm border border-0 border-b border-gray-400 focus:ring-0 focus:border-white" />
                </div>
              </div>

              <div key="8" class="grow flex items-end justify-end text-right mb-7">
                <ButtonsCyan text="SAVE" @clicked="addHolding()" />
              </div>
            </TransitionGroup>
          </div>
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

  async setup() {
    const token = await useState('authToken').value
    return { token }
  },

  mounted() {
    this.getPortfolio()
    this.setDateTime()
  },

  data() {
    return {
      manualForm: false,
      pageDetails: {
        title: 'Add Stock',
        subtitle: this.$route.params.portfolioName,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      portfolioId: this.$route.params.portfolio,
      searchResults: [],
      quote: null as ({} | null),
      invalidStock: false,
      invalidType: false,
      invalidShares: false,
      invalidPrice: false,
      invalidExchange: false,
      transaction: {
        name: null as (string | null),
        symbol: null as (string | null),
        currentPrice: null as (number | null),
        type: 0,
        quantity: null as (number | null),
        initialPrice: null as (number | null),
        exchangeRate: null as (number | null),
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    async getPortfolio(): Promise<void> {
      const response = await fetch('/api/portfolio-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
          .then(response => response.json())
      this.pageDetails.subtitle = response.data[0].name
    },

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

    toggleManual() {
      this.manualForm = !this.manualForm
    },

    parseDate() {
      const date = new Date(this.transaction.date + 'T' + this.transaction.time)
      return date.toISOString()
    },

    async addHolding(): Promise<void> {
      const holdingId = await fetch('/api/holding-create-stock', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          token: this.token,
          portfolio: this.portfolioId,
          manualEntry: this.manualForm,
          name: this.transaction.name,
          symbol: this.manualForm ? this.transaction.symbol : this.quote.symbol,
          currentPrice: this.transaction.currentPrice
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
            assetSymbol: this.manualForm ? this.transaction.symbol : this.quote.symbol,
            assetName: this.manualForm ? this.transaction.name : this.quote.companyName
          }
        }))
    }
  }
})
</script>
