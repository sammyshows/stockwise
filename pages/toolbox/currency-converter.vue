<template>
  <div class="flex flex-col justify-between h-full">
    <div class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
      </div>

      <div class="overflow-scroll grow pb-5">
        <p class="mt-3 px-6 text-xs text-center text-gray-400">Compare values in various different currencies using today’s exchange rate.</p>

        <div class="flex items-center h-20 my-6 py-3 px-3 border-y border-gray-200 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
          <div class="flex items-center grow h-full py-1">
            <IconsArrowsRightLeft @click="swapCurrencies()" class="mr-4 text-bright-cyan" />

            <div class="flex flex-col grow h-full justify-around text-sm truncate">
              <p class="truncate">{{ currencies[fromCurrency] }}</p>
              <p class="truncate">{{ currencies[toCurrency] }}</p>
            </div>
          </div>
          <div v-if="quote">
            <p class="font-normal text-2xl text-right tracking-wider truncate">{{ $formatNumber(quote.currentPrice, 5) }}</p>
            <p class="mt-1 font-normal text-sm text-right" :class="{ 'text-bright-red': BigNumber(quote.currentPrice).minus(quote.prevClose).toNumber() < 0, 'text-bright-green': BigNumber(quote.currentPrice).minus(quote.prevClose).toNumber() > 0 }">
              {{ $formatNumber(BigNumber(quote.currentPrice).minus(quote.prevClose).toNumber(), 5, false, true) }} ({{ $formatNumber(BigNumber(quote.currentPrice).minus(quote.prevClose).div(quote.prevClose).times(100).toNumber(), 2, false, true) }}%)
            </p>
          </div>
          <Spinner v-else class="w-auto h-auto mr-2" />
        </div>

        <div class="mt-7">
          <div class="flex items-center justify-center">
            <input v-model="fromValue" @keyup="updateValue('toValue')" autocomplete="off" type="number" class="focus:ring-0 focus:border-white block bg-gray-500/20 w-1/3 text-center border-gray-600 rounded-md tracking-wide" />
            <span class="w-6 mx-4 text-3xl text-bright-cyan">=</span>
            <input v-model="toValue" @keyup="updateValue('fromValue')" autocomplete="off" type="number" class="focus:ring-0 focus:border-white block bg-gray-500/20 w-1/3 text-center border-gray-600 rounded-md tracking-wide" />
          </div>

          <div class="flex justify-center mt-3">
            <select v-model="fromCurrency" @change="getQuote('fromValue')" class="w-1/3 mt-1.5 py-2 rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" style="touch-action: manipulation">
              <option v-for="currency in Object.keys(currencies)" :value="currency">{{ currency }}</option>
            </select>
            <span class="w-6 mx-4"></span>
            <select v-model="toCurrency" @change="getQuote('toValue')" class="w-1/3 mt-1.5 py-2 rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" style="touch-action: manipulation">
              <option v-for="currency in Object.keys(currencies)" :value="currency">{{ currency }}</option>
            </select>
          </div>
        </div>

        <p v-if="fromValue > 0 && toValue > 0 && quote" class="mt-10 px-8 text-xs text-gray-400 text-center">
          <span class="text-bright-cyan">{{ $formatNumber(fromValue, 2, true, false, fromCurrency) }} ({{ fromCurrency }})</span>
          is equal to approximately
          <span class="text-bright-cyan">{{ $formatNumber(toValue, 2, true, false, toCurrency) }} ({{ toCurrency }})</span> at exchange rate of
          <span class="text-bright-cyan">{{ $formatNumber(quote.currentPrice, 3) }}</span>.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BigNumber from "bignumber.js";
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";

export default defineComponent({
  name: "Toolbox",

  async setup() {
    const authStore = useAuth()
    const userStore = useUser()
    return { authStore, userStore }
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.uuid = this.userStore.userId

    await this.getQuote()
    this.fromValue = 1000
    this.updateValue('toValue')
  },

  data() {
    return {
      domain: useRuntimeConfig().DOMAIN,
      token: '',
      uuid: '',
      pageDetails: {
        title: 'Currency Converter',
        subtitle: 'TOOLBOX',
        returnPath: '/toolbox'
      },
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      fromValue: null as (number | null),
      toValue: null as (number | null),
      quote: null as ({} | null),
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
    }
  },

  methods: {
    async getQuote(valueToUpdate?): Promise<void> {
      if (this.fromCurrency && this.toCurrency) {
        this.quote = null
        const data = await fetch(this.domain + '/api/iex-quote-forex', {
          headers: {
            authorization: this.token
          },
          method: 'POST',
          body: JSON.stringify({
            from: this.fromCurrency,
            to: this.toCurrency
          })
        })
          .then(response => response.json())

        this.quote = data
        if (valueToUpdate)
          this.updateValue(valueToUpdate)
      }
    },

    updateValue(valueToUpdate: string) {
      if (valueToUpdate === 'toValue')
        this.toValue = this.BigNumber(this.fromValue).times(this.quote.currentPrice).toNumber().toFixed(2)
      else
        this.fromValue = this.BigNumber(this.toValue).div(this.quote.currentPrice).toNumber().toFixed(2)
    },

    async swapCurrencies() {
      const oldFrom = this.fromCurrency
      const oldTo = this.toCurrency

      this.fromCurrency = oldTo
      this.toCurrency = oldFrom

      await this.getQuote()
      this.updateValue('toValue')
    },

    BigNumber
  }
})
</script>