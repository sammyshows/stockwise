<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between h-14 mb-5 px-3">
      <PageTitle v-if="pageDetails.subtitle" :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div class="flex flex-col grow px-3">
      <div class="flex flex-col grow pb-3">
        <div class="flex flex-col grow justify-between mt-3">
          <ClientOnly>
            <div class="h-0 px-4 flex flex-col grow overflow-scroll text-xs">
              <TransitionGroup name="form">
                <div key="1" v-if="!manualForm">
                  <div class="relative" >
                    <div class="absolute inset-y-0 left-0 px-3 flex items-center pointer-events-none text-gray-600">
                      <SearchIcon class="h-7 w-7" :class="{ 'mt-5': invalid.quote }" aria-hidden="true" />
                    </div>
                    <p class="mb-1.5 ml-1 text-tiny leading-normal" :class="[ invalid.quote ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select a company</p>
                    <input @keyup="fetchSearch($event.target.value); this.invalid.quote = false" autocomplete="off" type="text" name="search" placeholder="Find your stock..." class="pl-12 placeholder:text-sm placeholder:text-gray-600 placeholder:italic focus:ring-0 focus:border-white block bg-gray-900/20 w-full border-gray-400/40 rounded-lg" />
                    <div v-if="searchResults.length !== 0" class="absolute max-h-64 w-full overflow-scroll mt-0.5 divide-y divide-gray-700 bg-gray-600 border border-t-0 border-gray-600 rounded-b-lg z-10">
                      <div v-for="result in searchResults" @click="fetchQuote(result.symbol)" class="flex justify-between items-center h-10 w-full px-3 gap-x-3" style="touch-action: manipulation">
                        <p class="w-2/5 whitespace-nowrap">{{ result.symbol + " : " + result.exchange }}</p>
                        <p class="w-2/5 text-right truncate">{{ result.securityName }}</p>
                      </div>
                    </div>
                  </div>

                  <button @click="toggleManual" key="5" style="touch-action: manipulation" class="w-max mt-4 mb-3 px-4 py-1 rounded-lg border border-gray-500 bg-white/10 text-gray-200 text-italic text-xs">Can't find a company?</button>

                  <div v-if="quote" class="w-full h-16 px-3 mb-5">
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
                        <p class="truncate" :class="{ 'text-bright-red': quote.change < 0, 'text-bright-green': quote.change > 0 }">{{ $formatNumber(quote.change, 2, false, true) }} ({{ $formatNumber(quote.changePercent * 100, 2 , false, true) }}%)</p>
                      </div>
                    </div>
                    <Spinner class="h-16" v-else />
                  </div>
                </div>

                <div v-else key="2">
                  <p class="mb-2 px-6 text-xs text-center text-gray-400">Use the fields below to manually enter details for your stock:</p>
                  <div>
                    <label for="name" class="flex items-end">Name</label>
                    <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.name ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add the name of the company</p>
                    <input @keyup="invalid.name = false" v-model="transaction.name" id="name" type="text" autocomplete="off" placeholder="e.g. Microsoft Inc" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                  </div>

                  <div class="mt-2">
                    <label for="symbol" class="flex items-end">Symbol</label>
                    <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.symbol ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a symbol for the company</p>
                    <input @keyup="invalid.symbol = false" v-model="transaction.symbol" id="symbol" type="text" autocomplete="off" placeholder="e.g. MSFT" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                  </div>

                  <div class="mt-2">
                    <label for="currentPrice" class="flex items-end">Current price</label>
                    <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.currentPrice ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add the current price of the company</p>
                    <input @keyup="invalid.currentPrice = false" v-model="transaction.currentPrice" id="currentPrice" type="number" autocomplete="off" placeholder="e.g. 271.29" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                  </div>

                  <div class="mt-2">
                    <label for="currency" class="block">Local currency</label>
                    <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.currency ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select the local currency of the stock</p>
                    <select @change="invalid.currency = false" v-model="assetCurrency" id="currency" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" style="touch-action: manipulation">
                      <option v-for="currency in currencies" :value="currency.ticker">{{ currency.ticker + ' - ' + currency.name }}</option>
                    </select>
                  </div>

                  <button @click="toggleManual" key="5" style="touch-action: manipulation" class="w-max mt-4 mb-3 px-4 py-1 rounded-lg border border-gray-500 bg-white/10 text-gray-200 text-italic text-xs">Search for a company</button>
                </div>

                <div :key="3" class="mb-2">
                  <label for="type" class="flex items-end">Transaction type</label>
                  <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.type ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select a transaction type</p>
                  <select @change="invalid.type = false" v-model="transaction.type" id="type" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" style="touch-action: manipulation">
                    <option value="" disabled selected hidden></option>
                    <option :value="0">BUY</option>
                    <option :value="1" disabled>SELL</option>
                    <option :value="2" disabled>DIVIDEND</option>
                    <option :value="3" disabled>DIVIDEND & REINVESTMENT (DRIP)</option>
                    <option :value="4" disabled>SHARE SPLIT</option>
                    <option :value="5" disabled>SELL SHORT (Coming soon)</option>
                  </select>
                </div>
                <div :key="4" class="mb-2">
                  <label for="quantity">Quantity</label>
                  <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.quantity ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive quantity</p>
                  <input @keyup="invalid.quantity = false" v-model="transaction.quantity" id="quantity" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                </div>
                <div :key="5" class="mb-2">
                  <label for="initialPrice">Price</label>
                  <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.initialPrice ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive price</p>
                  <input @keyup="invalid.initialPrice = false" v-model="transaction.initialPrice" id="initialPrice" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                </div>
                <div :key="6" class="mb-2">
                  <label for="exchangeRate">Exchange rate (optional)</label>
                  <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.exchangeRate ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive exchange rate or leave the field empty</p>
                  <input @keyup="invalid.exchangeRate = false" v-model="transaction.exchangeRate" id="exchangeRate" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                </div>
                <div v-if="transaction.type === 1" :key="5" class="mb-2">
                  <label for="method" class="flex items-end">Method</label>
                  <select v-model="transaction.sellMethod" id="method" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" style="touch-action: manipulation">
                    <option :value="0">FIFO</option>
                    <option :value="1">Custom Selection</option>
                  </select>
                </div>
                <div :key="7" class="w-full flex justify-between gap-x-4">
                  <div class="flex flex-col w-full">
                    <label for="date" class="text-xs">Date</label>
                    <input v-model="transaction.date" id="date" type="date" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
                  </div>
                  <div class="flex flex-col w-full">
                    <label for="time" class="text-xs">Time</label>
                    <input v-model="transaction.time" id="time" type="time" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
                  </div>
                </div>

                <div key="8" class="grow flex items-end justify-end my-7 text-right">
                  <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'SAVING' : 'SAVE'" @clicked="addHolding()" />
                </div>
              </TransitionGroup>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
    <!--  this div below is used to "close" the search results box when a user clicks away  -->
    <div v-if="searchResults.length !== 0" @click="clearSearchResults" class="absolute top-0 left-0 bottom-14 right-0" style="touch-action: manipulation"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SearchIcon } from '@heroicons/vue/solid'
import { useAuth } from "@/store/auth";
import { computed } from "@vue/reactivity";
import { usePortfolios } from "@/store/portfolios";


export default defineComponent({
  name: "New Stock",

  setup() {
    const route = useRoute()
    const authStore = useAuth()
    const portfolioStore = usePortfolios()
    const portfolio = computed(() => portfolioStore.getPortfolio(route.params.portfolio))

    return { authStore, portfolio }
  },

  components: {
    SearchIcon
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.getPortfolio()
    this.setDateTime()
    if (this.$route.params.assetSymbol)
      this.fetchQuote(this.$route.params.assetSymbol)
  },

  data() {
    return {
      domain: useRuntimeConfig().DOMAIN,
      token: '',
      manualForm: false,
      disabledSave: false,
      pageDetails: {
        title: 'Add Stock',
        subtitle: this.portfolio?.portfolio_name,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      portfolioId: this.$route.params.portfolio,
      searchResults: [],
      quote: null as ({} | null),
      currencies: [
        { ticker: 'AUD', name: 'Australian Dollar' },
        { ticker: 'CAD', name: 'Canadian Dollar' },
        { ticker: 'CHF', name: 'Swiss Franc' },
        { ticker: 'CNH', name: 'Chinese Yuan Renminbi (HK)' },
        { ticker: 'CZK', name: 'Czech Koruna' },
        { ticker: 'DKK', name: 'Danish Krone' },
        { ticker: 'EUR', name: 'Euro' },
        { ticker: 'GBP', name: 'British Pound' },
        { ticker: 'HKD', name: 'Hong Kong Dollar' },
        { ticker: 'HUF', name: 'Hungarian Forint' },
        { ticker: 'ILS', name: 'Israeli New Shekel' },
        { ticker: 'INR', name: 'Indian Rupee' },
        { ticker: 'JPY', name: 'Japanese Yen' },
        { ticker: 'MXN', name: 'Mexican Peso' },
        { ticker: 'NOK', name: 'Norwegian Krone' },
        { ticker: 'NZD', name: 'New Zealand Dollar' },
        { ticker: 'PLN', name: 'Polish Zloty' },
        { ticker: 'RON', name: 'Romanian Leu' },
        { ticker: 'RUB', name: 'Russian Ruble' },
        { ticker: 'SEK', name: 'Swedish Krona' },
        { ticker: 'SGD', name: 'Singapore Dollar' },
        { ticker: 'THB', name: 'Thai Baht' },
        { ticker: 'TRY', name: 'Turkish Lira' },
        { ticker: 'USD', name: 'U.S. Dollar' },
        { ticker: 'ZAR', name: 'South African Rand' }
      ],
      assetCurrency: null,
      invalid: {
        quote: false,
        name: false,
        symbol: false,
        currentPrice: false,
        currency: false,
        type: false,
        quantity: false,
        initialPrice: false,
        exchangeRate: false
      },
      transaction: {
        name: '' as (string | null),
        symbol: '' as (string | null),
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
    validateForm(): Boolean {
      if (this.transaction.type === null)
        this.invalid.type = true
      if (!this.transaction.quantity || this.transaction.quantity <= 0)
        this.invalid.quantity = true
      if (this.transaction.initialPrice === null || this.transaction.initialPrice === '' || this.transaction.initialPrice < 0)
        this.invalid.initialPrice = true
      if (this.transaction.exchangeRate && this.transaction.exchangeRate <= 0)
        this.invalid.exchangeRate = true

      return this.invalid.type === false && this.invalid.quantity === false && this.invalid.initialPrice === false && this.invalid.exchangeRate === false
    },

    validateQuote(): Boolean {
      if (this.manualForm) {
        if (this.transaction.name === '')
          this.invalid.name = true
        if (this.transaction.symbol === '')
          this.invalid.symbol = true
        if (!this.transaction.currentPrice || this.transaction.currentPrice < 0)
          this.invalid.currentPrice = true
        if (!this.assetCurrency)
          this.invalid.currency = true

        return this.invalid.name === false && this.invalid.symbol === false && this.invalid.currentPrice === false && this.invalid.currency === false
      } else {
        if (!this.quote)
          this.invalid.quote = true

        return this.invalid.quote === false
      }
    },

    async getPortfolio(): Promise<void> {
      const response = await fetch(this.domain + '/api/portfolio-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
          .then(response => response.json())
      this.pageDetails.subtitle = response.data[0].portfolio_name
    },

    async fetchSearch(searchTerm: string): Promise<void> {
      const data = await fetch(this.domain + '/api/stock-search', {
        headers: {
          authorization: this.token
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
      const quote = await fetch(this.domain + '/api/stock-quote', {
        headers: {
          authorization: this.token
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
      this.disabledSave = true
      this.validateForm() // This is so that the validation checks are still run even if validateQuote fails below
      if (this.validateQuote() && this.validateForm()) {
        const holdingId = await fetch(this.domain + '/api/holding-create-stock', {
          headers: {
            authorization: this.token
          },
          method: 'POST',
          body: JSON.stringify({
            token: this.token,
            portfolio: this.portfolioId,
            manualEntry: this.manualForm,
            name: this.transaction.name,
            symbol: this.manualForm ? this.transaction.symbol : this.quote.symbol,
            currentPrice: this.transaction.currentPrice,
            currency: this.assetCurrency
          })
        })
          .then(response => response.json())
          .then(data => data.holdingId)

        await this.addTransaction(holdingId)
      }
      this.disabledSave = false
    },

    async addTransaction(holdingId): Promise<void> {
      const response = await fetch(this.domain + '/api/transaction-create', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          holdingId: holdingId,
          type: this.transaction.type,
          sellMethod: null,
          quantity: this.transaction.quantity,
          initialPrice: this.transaction.initialPrice,
          exchangeRate: this.transaction.exchangeRate,
          timestamp: this.parseDate()
        })
      })

      if (response.status === 200) {
        this.$emit('updateHoldings')
        await this.$router.push({name: 'portfolios-portfolio-holdings-holding',
          params: {
            portfolio: this.portfolioId,
            holding: holdingId,
            assetSymbol: this.manualForm ? this.transaction.symbol : this.quote.symbol,
            assetName: this.manualForm ? this.transaction.name : this.quote.companyName
          }
        })
      }
    }
  }
})
</script>
