<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between h-14 mb-10">
      <PageTitle v-if="pageDetails.subtitle" :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div class="flex flex-col grow px-5">
      <div class="flex flex-col grow justify-between gap-y-4 mt-3">
        <div class="h-0 px-2 flex flex-col grow overflow-scroll gap-y-4 text-sm">
          <div>
            <label for="type" class="flex items-end">Transaction type</label>
            <select v-model="transaction.type" id="type" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
              <option value="" disabled selected hidden></option>
              <option :value="0">BUY</option>
              <option :value="1">SELL</option>
            </select>
          </div>
          <div>
            <label for="from" class="flex items-end">From</label>
            <select v-model="transaction.from" id="from" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
              <option value="" disabled selected hidden></option>
              <option v-for="currency in currencies" :value="currency">{{ currency }}</option>
            </select>
          </div>
          <div>
            <label for="to" class="flex items-end">To</label>
            <select v-model="transaction.to" id="to" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
              <option value="" disabled selected hidden></option>
              <option v-for="currency in currencies" :value="currency">{{ currency }}</option>
            </select>
          </div>

<!--          <div v-if="quote" class="h-20 px-3">-->
<!--            <p class="text-center truncate">{{ quote.companyName }}</p>-->
<!--            <div v-if="Object.keys(quote).length !== 0" class="flex text-xs">-->
<!--              <div class="w-1 grow text-right">-->
<!--                <p class="truncate">{{ quote.symbol }}</p>-->
<!--                <p class="truncate">Current price</p>-->
<!--                <p class="truncate">Daily movement</p>-->
<!--              </div>-->
<!--              <div class="w-3 text-center">-->
<!--                <p>:</p>-->
<!--                <p>:</p>-->
<!--                <p>:</p>-->
<!--              </div>-->
<!--              <div class="w-1 grow">-->
<!--                <p class="truncate">{{ quote.primaryExchange }}</p>-->
<!--                <p class="truncate">{{ quote.latestPrice }}</p>-->
<!--                <p class="truncate" :class="{ 'text-bright-red': quote.change < 0, 'text-bright-green': quote.change > 0 }">{{ $addSign($formatNumber(quote.change, 2)) }} ({{ $addSign($formatNumber(quote.changePercent * 100), 2) }}%)</p>-->
<!--              </div>-->
<!--            </div>-->
<!--            <Spinner v-else />-->
<!--          </div>-->

          <div>
            <label for="amount" class="flex items-end">Amount</label>
            <input v-model="transaction.amount" id="amount" type="number" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
          </div>
          <div>
            <label for="initial_rate" class="flex items-end">Initial rate</label>
            <input v-model="transaction.initialRate" id="initial_rate" type="number" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-white text-sm">
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "New Forex",

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
      pageDetails: {
        title: 'Add Forex',
        subtitle: this.$route.params.portfolioName,
        returnPath: `/portfolios/${this.$route.params.portfolio}`
      },
      portfolioId: this.$route.params.portfolio,
      currencies: [
          'AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'ILS', 'JPY', 'MXN', 'NOK', 'NZD', 'SEK', 'SGD', 'THB', 'TRY', 'USD',
      ],
      quote: null as ({} | null),
      transaction: {
        type: null as (string | null),
        from: null as (string | null),
        to: null as (string | null),
        amount: null as (number | null),
        initialRate: null as (number | null),
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
      const holdingId = await fetch('/api/holding-create-forex', {
        headers: {
          authorization: 'Bearer ' + this.token
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
          quantity: this.transaction.amount,
          initialPrice: this.transaction.initialRate,
          timestamp: this.parseDate()
        })
      })
        .then(this.$router.push({name: 'portfolios-portfolio-holdings-holding',
          params: {
            portfolio: this.portfolioId,
            holding: holdingId,
            // assetSymbol: this.transaction.from + this.transaction.to,
            // assetName: this.quote.companyName
          }
        }))
    }
  }
})
</script>
