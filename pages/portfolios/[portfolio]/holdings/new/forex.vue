<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between h-14 mb-5 px-3">
      <PageTitle v-if="pageDetails.subtitle" :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div class="flex flex-col grow px-5">
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <ClientOnly>
          <div class="h-0 px-2 flex flex-col grow overflow-scroll overflow-x-hidden gap-y-4 text-xs">
            <TransitionGroup name="form">
              <div key="1" class="flex w-full gap-x-3">
                <div class="grow">
                  <label for="from" class="flex items-end">From</label>
                  <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.from ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Select a currency</p>
                  <select v-model="transaction.from" @change="getQuote(); invalid.from = false;" id="from" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                    <option value="" disabled selected hidden></option>
                    <option v-for="currency in Object.keys(currencies)" :value="currency">{{ currency }}</option>
                  </select>
                </div>
                <div class="grow">
                  <label for="to" class="flex items-end">To</label>
                  <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.to ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Select a currency</p>
                  <select v-model="transaction.to" @change="getQuote(); invalid.to = false;" id="to" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                    <option value="" disabled selected hidden></option>
                    <option v-for="currency in Object.keys(currencies)" :value="currency">{{ currency }}</option>
                  </select>
                </div>
              </div>

              <div key="2" v-if="quote">
                <div v-if="Object.keys(quote).length !== 0" class="flex flex-col justify-center w-full h-full py-3 px-3 rounded border border-gray-600">
                  <div class="w-full flex text-base">
                    <p class="grow tracking-wider">{{ transaction.from + transaction.to }}</p>
                    <p class="w-20 text-right">{{ $formatNumber(quote.currentPrice, 5) }}</p>
                    <p class="w-20 text-right" :class="{ 'text-bright-red': quote.currentPrice - quote.prevClose < 0, 'text-bright-green': quote.currentPrice - quote.prevClose > 0 }">{{ $formatNumber(quote.currentPrice - quote.prevClose, 5, false, true) }}</p>
                  </div>
                  <div class="w-full flex text-tiny">
                    <p class="grow truncate mr-3">{{ quote.name }}</p>
                    <p class="w-16 text-right" :class="{ 'text-bright-red': (quote.currentPrice - quote.prevClose) / quote.prevClose * 100 < 0, 'text-bright-green': (quote.currentPrice - quote.prevClose) / quote.prevClose * 100 > 0 }">{{ $formatNumber((quote.currentPrice - quote.prevClose) / quote.prevClose * 100, 2, false, true) }}%</p>
                  </div>
                </div>
                <Spinner class="h-16" v-else />
              </div>

              <div key="3">
                <label for="type" class="flex items-end">Transaction type</label>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.type ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select a transaction type</p>
                <select v-model="transaction.type" @change="invalid.type = false;" id="type" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                  <option value="" disabled selected hidden></option>
                  <option :value="0">BUY</option>
                  <option :value="1" disabled>SELL</option>
                </select>
              </div>

              <div key="4">
                <label for="amount" class="flex items-end">Amount</label>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.amount ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive amount</p>
                <input v-model="transaction.amount" @keyup="invalid.amount = false;" id="amount" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
              </div>

              <div key="5">
                <label for="initial_rate" class="flex items-end">Initial rate</label>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.initialRate ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add the currency rate</p>
                <input v-model="transaction.initialRate" @keyup="invalid.initialRate = false;" id="initial_rate" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
              </div>

              <div key="6">
                <label for="exchangeRate">Exchange rate (optional)</label>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.exchangeRate ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive exchange rate or leave the field empty</p>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.from ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Select a currency</p>
                <input v-model="transaction.exchangeRate" @keyup="invalid.exchangeRate = false;" id="exchangeRate" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
              </div>

              <div key="7" class="w-full flex justify-between gap-x-4">
                <div>
                  <label for="date">Date</label>
                  <input v-model="transaction.date" id="date" type="date" class="box-border w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
                </div>
                <div>
                  <label for="time">Time</label>
                  <input v-model="transaction.time" id="time" type="time" class="box-border w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
                </div>
              </div>

              <div key="8" class="grow flex items-end justify-end text-right mb-7">
                <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'CREATING' : 'CREATE'" @clicked="addHolding()" />
              </div>
            </TransitionGroup>
          </div>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuth } from "@/store/auth";
import { computed } from "@vue/reactivity";
import { usePortfolios } from "@/store/portfolios";


export default defineComponent({
  name: "New Forex",

  setup() {
    const route = useRoute()
    const authStore = useAuth()
    const portfolioStore = usePortfolios()
    const portfolio = computed(() => portfolioStore.getPortfolio(route.params.portfolio))

    return { authStore, portfolio }
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.getPortfolio()
    this.setDateTime()
  },

  data() {
    return {
      domain: useRuntimeConfig().DOMAIN,
      token: '',
      disabledSave: false,
      pageDetails: {
        title: 'Add Forex',
        subtitle: this.portfolio?.portfolio_name,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      portfolioId: this.$route.params.portfolio,
      currencies: {
        AUD: "Australian Dollar",
        CAD: "Canadian Dollar",
        CHF: "Swiss Franc",
        CNH: "Chinese Yuan Renminbi (HK)",
        CZK: "Czech Koruna",
        DKK: "Danish Krone",
        EUR: "Euro",
        GBP: "British Pound",
        HKD: "Hong Kong Dollar",
        HUF: "Hungarian Forint",
        ILS: "Israeli New Shekel",
        INR: "Indian Rupee",
        JPY: "Japanese Yen",
        MXN: "Mexican Peso",
        NOK: "Norwegian Krone",
        NZD: "New Zealand Dollar",
        PLN: "Polish Zloty",
        RON: "Romanian Leu",
        RUB: "Russian Ruble",
        SEK: "Swedish Krona",
        SGD: "Singapore Dollar",
        THB: "Thai Baht",
        TRY: "Turkish Lira",
        USD: "U.S. Dollar",
        ZAR: "South African Rand"
      },
      quote: null as ({} | null),
      invalid: {
        from: false,
        to: false,
        type: false,
        amount: false,
        initialRate: false,
        exchangeRate: false
      },
      transaction: {
        from: null as (string | null),
        to: null as (string | null),
        type: 0,
        amount: null as (number | null),
        initialRate: null as (number | null),
        exchangeRate: null as (number | null),
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    validateForm(): Boolean {
      console.log(this.transaction)
      if (this.transaction.from === null)
        this.invalid.from = true
      if (this.transaction.to === null)
        this.invalid.to = true
      if (this.transaction.type === null)
        this.invalid.type = true
      if (!this.transaction.amount || this.transaction.amount <= 0)
        this.invalid.amount = true
      if (this.transaction.initialRate === null || this.transaction.initialRate === '' || this.transaction.initialRate < 0)
        this.invalid.initialRate = true
      if (this.transaction.exchangeRate && this.transaction.exchangeRate <= 0)
        this.invalid.exchangeRate = true

      return this.invalid.from === false && this.invalid.to === false && this.invalid.type === false && this.invalid.amount === false && this.invalid.initialRate === false && this.invalid.exchangeRate === false
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

    async getQuote(): Promise<void> {
      if (this.transaction.from && this.transaction.to) {
        this.quote = {}
        const data = await fetch(this.domain + '/api/iex-quote-forex', {
          headers: {
            authorization: this.token
          },
          method: 'POST',
          body: JSON.stringify({
            from: this.transaction.from,
            to: this.transaction.to
          })
        })
            .then(response => response.json())
        this.quote = data
      }
    },

    async addHolding(): Promise<void> {
      this.disabledSave = true
      if (this.validateForm()) {
        const holdingId = await fetch(this.domain + '/api/holding-create-forex', {
          headers: {
            authorization: this.token
          },
          method: 'POST',
          body: JSON.stringify({
            token: this.token,
            portfolio: this.portfolioId,
            from: this.transaction.from,
            to: this.transaction.to
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
          token: this.token,
          holdingId: holdingId,
          type: this.transaction.type,
          sellMethod: null,
          quantity: this.transaction.amount,
          initialPrice: this.transaction.initialRate,
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
            assetSymbol: this.transaction.from + this.transaction.to,
            assetName: this.currencies[this.transaction.from] + " to " + this.currencies[this.transaction.from]
          }
        })
      }
    }
  }
})
</script>


