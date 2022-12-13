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
              <div key="1">
                <label for="from" class="flex items-end">Currency</label>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.currency ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select a currency</p>
                <select v-model="transaction.currency" @change="invalid.currency = false" id="from" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" style="touch-action: manipulation">
                  <option value="" disabled selected hidden></option>
                  <option v-for="currency in Object.keys(currencies)" :value="currency">{{ currency }}</option>
                </select>
              </div>

              <div key="2">
                <label for="type" class="flex items-end">Transaction type</label>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.type ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select a transaction type</p>
                <select v-model="transaction.type" @change="invalid.type = false" id="type" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" style="touch-action: manipulation">
                  <option value="" disabled selected hidden></option>
                  <option :value="0">BUY</option>
                  <option :value="1" disabled>SELL</option>
                </select>
              </div>

              <div key="3">
                <label for="amount" class="flex items-end">Amount</label>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.amount ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive amount</p>
                <input v-model="transaction.amount" @change="invalid.amount = false" id="amount" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
              </div>

  <!--            <div key="4">-->
  <!--              <label for="exchangeRate">Exchange rate (optional)</label>-->
  <!--              <p class="mt-0.5 ml-1 text-tiny leading-normal" @change="invalid.exchangeRate = false" :class="[ invalid.exchangeRate ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a positive exchange rate or leave the field empty</p>-->
  <!--              <input @keyup="invalid.exchangeRate = false" v-model="transaction.exchangeRate" id="exchangeRate" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">-->
  <!--            </div>-->

              <div key="4" class="w-full flex justify-between gap-x-4">
                <div>
                  <label for="date">Date</label>
                  <input v-model="transaction.date" id="date" type="date" class="box-border w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
                </div>
                <div>
                  <label for="time">Time</label>
                  <input v-model="transaction.time" id="time" type="time" class="box-border w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" />
                </div>
              </div>

              <div key="5" class="grow flex items-end justify-end text-right mb-7">
                <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'SAVING' : 'SAVE'" @clicked="addHolding()" />
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
        title: 'Add Cash',
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
      invalid: {
        currency: false,
        type: false,
        amount: false,
        exchangeRate: false
      },
      transaction: {
        currency: null as (string | null),
        type: 0,
        amount: null as (number | null),
        exchangeRate: 1,
        date: null as (string | null),
        time: null as (string | null)
      }
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.transaction.currency === null)
        this.invalid.currency = true
      if (this.transaction.type === null)
        this.invalid.type = true
      if (!this.transaction.amount || this.transaction.amount < 0)
        this.invalid.amount = true
      if (this.transaction.exchangeRate && this.transaction.exchangeRate <= 0)
        this.invalid.exchangeRate = true

      return this.invalid.currency === false && this.invalid.type === false && this.invalid.amount === false && this.invalid.exchangeRate === false
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

    async addHolding(): Promise<void> {
      this.disabledSave = true
      if (this.validateForm()) {
        const holdingId = await fetch(this.domain + '/api/holding-create-cash', {
          headers: {
            authorization: this.token
          },
          method: 'POST',
          body: JSON.stringify({
            token: this.token,
            portfolio: this.portfolioId,
            symbol: this.transaction.currency
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
          exchangeRate: this.transaction.exchangeRate,
          initialPrice: 1,
          timestamp: this.parseDate()
        })
      })

      if (response.status === 200) {
        this.$emit('updateHoldings')
        await this.$router.push({name: 'portfolios-portfolio-holdings-holding',
          params: {
            portfolio: this.portfolioId,
            holding: holdingId,
            assetSymbol: this.transaction.currency,
            assetName: this.currencies[this.transaction.currency]
          }
        })
      }
    }
  }
})
</script>


