<template>
  <div class="flex flex-col justify-between h-full">
    <div class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
      </div>

      <div class="overflow-y-scroll overflow-x-hidden flex flex-col pb-5">
        <p class="mt-3 px-6 text-xs text-center text-gray-400">Estimate the future value of an investment by forecasting the annual growth.</p>

        <div class="flex flex-col items-center justify-center w-full mt-6 mb-3 py-4 px-3 border-y border-gray-200 bg-gray-900/30 text-bright-cyan" style="font-family: Poppins-Light; box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
          <div class="flex items-center uppercase mb-4">
            <input v-model="initialValue" autocomplete="off" type="number" class="focus:ring-0 focus:border-white block bg-gray-500/20 w-24 h-8 mr-3 text-center text-gray-200 border-gray-600 rounded-md tracking-wide" />
            <p>invested at an</p>
          </div>

          <div class="flex items-center uppercase mb-4">
            <p>annual growth rate of</p>
            <input v-model="growthRate" autocomplete="off" type="number" class="focus:ring-0 focus:border-white block bg-gray-500/20 w-12 h-8 ml-3 px-1 text-center text-gray-200 border-gray-600 rounded-md tracking-wide" />
            <p>&nbsp;%</p>
          </div>

          <div class="flex items-center uppercase mb-4">
            <p>compounding</p>
            <select v-model="compoundFrequency" class="w-32 h-8 ml-3 p-0 pl-2 rounded-md bg-gray-500/20 border border-gray-400/40 text-base text-gray-200 focus:ring-0 focus:border-white" style="touch-action: manipulation">
              <option v-for="period in compounds" :value="period">{{ period.title }}</option>
            </select>
            <p>&nbsp;,</p>
          </div>

          <div class="flex items-center uppercase">
            <p>after</p>
            <input v-model="duration" autocomplete="off" type="number" class="focus:ring-0 focus:border-white block bg-gray-500/20 w-12 h-8 mx-3 px-1 text-center text-gray-200 border-gray-600 rounded-md tracking-wide" />
            <p>years would be:</p>
          </div>

          <div>
            <p v-if="totalValue" style="min-width: 64px" class="flex items-center justify-center mt-3 px-5 text-2xl text-white tracking-wide">{{ $formatNumber(totalValue, 2, false, false) || '0' }}</p>
            <p v-if="totalValue" class="mt-1 px-8 text-xs text-gray-200 text-center">Total return: <span :class="{ 'text-bright-red': BigNumber(totalValue).minus(totalPayments).isLessThan(-0.0000000001), 'text-bright-green': BigNumber(totalValue).minus(totalPayments).isGreaterThan(0.0000000001) }">{{ $formatNumber(totalValue - totalPayments, 2, false, false) }}</span></p>
          </div>
        </div>

        <p v-if="totalValue && totalValue > 1000000000" class="mt-2 px-8 text-xs text-gray-200 text-center">Wow, the future is looking bright for you...</p>

        <TransitionGroup name="growth-calculator">
          <button @click="setShowAdvanced(!showAdvanced)" key="1" style="touch-action: manipulation" class="w-max px-4 py-1 my-4 ml-5 rounded-lg border border-gray-400 bg-white/10 text-xs">{{ showAdvanced ? "Hide advanced options" : "Show advanced options" }}</button>
          <div v-if="showAdvanced" key="2" class="w-full px-5 text-xs">
            <div>
              <label for="payment" class="flex items-end">Additional payments per {{ compoundFrequency.period }}</label>
              <input v-model="additionalPayments" id="payment" autocomplete="off" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>

            <div class="flex flex-col gap-x-4 mt-4">
              <label for="payment-growth">Growth of payments (%)</label>
              <div class="flex">
                <div class="grow">
                  <input v-model="paymentGrowth" id="payment-growth" autocomplete="off" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                </div>
                <div v-if="compoundFrequency.period !== 'year'" class="w-1/2 pl-4">
                  <select v-model="paymentGrowsPerPayment" autocomplete="off" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                    <option :value="true">per payment</option>
                    <option :value="false">per year</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <label for="fees" class="flex items-end">Fees per {{ compoundFrequency.period }}</label>
              <input v-model="fees" id="fees" autocomplete="off" type="number" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>

            <div class="mt-4">
              <label for="payment-growth">Type of annuity</label>
              <select v-model="annuityType" autocomplete="off" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                <option value="due">Annuity due</option>
                <option value="ordinary">Ordinary annuity</option>
              </select>
            </div>
          </div>
        </TransitionGroup>
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
  },

  data() {
    return {
      token: '',
      uuid: '',
      pageDetails: {
        title: 'Growth Calculator',
        subtitle: 'TOOLBOX',
        returnPath: '/toolbox'
      },

      initialValue: 0 as (number | null),
      growthRate: null as (number | null),
      duration: null as (number | null),
      compoundFrequency: { title: 'Monthly', period: 'month', countPerYear: 12 },
      compounds: [
        { title: 'Daily (365)', period: 'day', countPerYear: 365 },
        { title: 'Weekly', period: 'week', countPerYear: 52 },
        { title: 'Monthly', period: 'month', countPerYear: 12 },
        { title: 'Quarterly', period: 'quarter', countPerYear: 4 },
        { title: 'Annually', period: 'year', countPerYear: 1 }
      ],
      showAdvanced: false,
      additionalPayments: null as (number | null),
      paymentGrowth: null as (number | null),
      paymentGrowsPerPayment: false,
      fees: null as (number | null),
      annuityType: 'due'
    }
  },

  computed: {
    totalValue() {
      if (typeof this.initialValue === 'number' && typeof this.growthRate === 'number' && typeof this.duration  === 'number') {

        let futureValueFromPrincipal
        let futureValueFromPayments
        let P = this.initialValue || 0
        let n = this.compoundFrequency.countPerYear
        let r = new BigNumber(this.growthRate).div(100).div(n).toNumber() || 0
        let t = this.duration
        let g = new BigNumber(this.paymentGrowth).div(100).div(this.paymentGrowsPerPayment ? 1 : n).toNumber() || 0
        let PMT = (this.additionalPayments || 0) - (this.fees || 0)

        // Growth of principal: [P(1 +r/n) ^ (nt)] * (1 + r)
        futureValueFromPrincipal = new BigNumber(P).times(Math.pow(new BigNumber(r).div(n).plus(1).toNumber(), new BigNumber(n).times(t).toNumber())).toNumber()

        // Growth of Payments (annuity due): PMT * (1 + r) * [(((1 + r) ^ (nt)) - ((1 + g) ^ (nt)) ) / (r - g)]
        if (r === g) // If the interest rate and growth rate are the same, we must use this formula instead:
          futureValueFromPayments = new BigNumber(Math.pow(1 + r, new BigNumber(n).times(t).minus(1).toNumber())).times(n).times(t).times(PMT).times(this.annuityType === 'due' ? 1 + r : 1).toNumber()
        else
          futureValueFromPayments = new BigNumber(Math.pow(1 + r, new BigNumber(n).times(t).toNumber())).minus(Math.pow(1 + g, new BigNumber(n).times(t).toNumber())).div(r - g).times(PMT).times(this.annuityType === 'due' ? 1 + r : 1).toNumber()

        return futureValueFromPrincipal + futureValueFromPayments
      }
    },

    totalPayments() {
      if (typeof this.initialValue === 'number' && typeof this.growthRate === 'number' && typeof this.duration  === 'number') {
        let totalValueOfPayments
        let P = this.initialValue || 0
        let n = this.compoundFrequency.countPerYear
        let r = 0
        let t = this.duration
        let g = new BigNumber(this.paymentGrowth).div(100).div(n).toNumber() || 0
        let PMT = (this.additionalPayments || 0) - (this.fees || 0)

        // NOTE: The rate (r) is intentionally set to 0 so we can calculate the total payments without interest. It could be removed but I've left it in there for readability.
        // Growth of Payments (annuity due): PMT * (1 + r) * [(((1 + r) ^ (nt)) - ((1 + g) ^ (nt)) ) / (r - g)]
        if (r === g) // If the interest rate and growth rate are the same, we must use this formula instead:
          totalValueOfPayments = new BigNumber(Math.pow(1 + r, new BigNumber(n).times(t).minus(1).toNumber())).times(n).times(t).times(PMT).times(1 + r).toNumber()
        else
          totalValueOfPayments = new BigNumber(Math.pow(new BigNumber(r).plus(1).toNumber(), new BigNumber(n).times(t).toNumber())).minus(Math.pow(new BigNumber(g).plus(1).toNumber(), new BigNumber(n).times(t).toNumber())).div(r - g).times(PMT).times(1 + r).toNumber()

        return P + totalValueOfPayments
      }
    }
  },

  methods: {
    setShowAdvanced(value: boolean) {
      this.showAdvanced = value
    },

    BigNumber
  }
})
</script>

<style scoped>
.growth-calculator-move, /* apply transition to moving elements */
.growth-calculator-enter-active {
  transition: all 0.5s ease;
}
.growth-calculator-leave-active {
  transition: all 0.3s ease;
}

.growth-calculator-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.growth-calculator-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* This has caused funny behaviour where elements 'leaving' get flung upwards - could be related to the "tag" value give to the <TransitionGroup> tag */
/*.growth-calculator-leave-active {*/
  /*position: absolute;*/
/*}*/
</style>