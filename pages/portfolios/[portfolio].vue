<template>
  <div class="flex h-full">
    <div v-if="viewHoldings" class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
        <div class="flex mr-1 gap-x-3">
          <NuxtLink :to="{ name: `portfolios-portfolio-holdings-new`, params: { portfolioId: portfolioId, portfolioName: pageDetails.title } }">
            <PlusIcon class="h-8 w-8" />
          </NuxtLink>
          <NuxtLink :to="{ name: `portfolios-portfolio-update`, params: { portfolioId: portfolioId } }">
            <PencilIcon class="h-7 w-7 mt-0.5" />
          </NuxtLink>
        </div>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <p v-if="responseReceived && holdings != null && holdings.length === 0" class="grow flex items-center px-2 text-sm text-bright-cyan text-center">To start tracking an investment in this portfolio, use the "+" icon above to record a transaction</p>
      <NuxtPage v-else-if="holdings && holdings.length > 0"
                :show="viewHoldings"
                :overviewChart="overviewChart"
                :total="total" />
    </div>
    <NuxtPage v-if="!viewHoldings" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PencilIcon } from "@heroicons/vue/outline";
import { PlusIcon } from "@heroicons/vue/solid";
import {BigNumber} from "bignumber.js";
import { computed } from "@vue/reactivity";
import { useHoldings } from "@/store/holdings";


export default defineComponent({
  name: "Portfolio Holdings",

  async setup() {
    const route = useRoute()
    const token = await useState('authToken').value
    const holdingStore = useHoldings()
    const holdings = computed(() => holdingStore.getHoldings(route.params.portfolio))
    return { token, holdingStore, holdings }
  },

  components: {
    PencilIcon, PlusIcon
  },

  async mounted() {
    this.getPortfolio()
    await this.getHoldings()
    this.getOverviewChart()
    setInterval(() => this.getHoldings(), 60000)
  },

  watch: {
    $route (to, from) {
      if (from.name === 'portfolios-portfolio-update')
        this.tabConfig.activeTab = 'HOLDINGS'
    }
  },

  data() {
    return {
      portfolioId: this.$route.params.portfolio,
      pageDetails: {
        title: this.$route.params.portfolioName,
        subtitle: 'PORTFOLIOS',
        returnPath: '/portfolios'
      },
      tabConfig: {
        activeTab: this.$route.path == `/portfolios/${this.$route.params.portfolio}/overview` ? 'OVERVIEW' : 'HOLDINGS',
        tabs: [
          { name: 'HOLDINGS', path: `/portfolios/${this.$route.params.portfolio}` },
          { name: 'OVERVIEW', path: `/portfolios/${this.$route.params.portfolio}/overview` }
        ]
      },
      responseReceived: false, // used to indicate whether a response has been received yet from the API call to holdings-read
      overviewChart: null as ([] | null)
    }
  },

  computed: {
    total: function() {
      if (this.holdings) {
        return this.holdings.reduce((total, { current_value, initial_value, daily_change, all_time_initial, realized, realized_initial }) => {
              total.current_value = total.current_value.plus(current_value)
              total.initial_value = total.initial_value.plus(initial_value)
              total.daily_change = total.daily_change.plus(daily_change)
              total.all_time_initial = total.all_time_initial.plus(all_time_initial || initial_value)

              if (realized) {
                total.realized = total.realized.plus(realized)
                total.realized_initial = total.realized_initial.plus(realized_initial)
              }

              return total
            },
            // This is the initial value, `total`, passed to reduce:
            {
              current_value: new BigNumber(0),
              initial_value: new BigNumber(0),
              daily_change: new BigNumber(0),
              all_time_initial: new BigNumber(0),
              realized: new BigNumber(0),
              realized_initial: new BigNumber(0)
            })
      }
    },

    viewHoldings() {
      return [this.tabConfig.tabs[0].path, this.tabConfig.tabs[1].path].includes(this.$route.path)
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

      this.pageDetails.title = response.data[0].name
    },

    async getHoldings(): Promise<void> {
      const response = await fetch('/api/holdings-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId
        })
      })
        .then(response => response.json())

      this.responseReceived = true
      this.holdingStore.replaceHoldings(this.portfolioId, response.data)
    },

    async getOverviewChart() {
      let chartData = await fetch('/api/portfolio-data-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          portfolioId: this.portfolioId,
          date: this.currentDate()
        })
      })
        .then(response => response.json())
        .then(response => response.chartData)

      if (chartData.length === 0) {
        this.overviewChart = chartData
        return
      }

      const lastDate = chartData[chartData.length - 1].date.slice(0, 10)
      if (lastDate === this.currentDate()) {
        this.chartData.pop()
      }
      chartData.push({
        current_value: this.total.current_value.toNumber(),
        initial_value: this.total.initial_value.toNumber(),
        all_time_change: this.total.current_value.plus(this.total.realized).minus(this.total.initial_value).toNumber(),
        all_time_percent: this.total.current_value.plus(this.total.realized).minus(this.total.initial_value).div(this.total.all_time_initial).times(100).toNumber(),
        date: this.currentDate()
      })

      this.overviewChart = chartData
    },

    currentDate() {
      // Get today's date in the local timezone
      let currentDate = new Date()
      const offset = currentDate.getTimezoneOffset()
      currentDate = new Date(currentDate.getTime() - (offset*60*1000))
      return currentDate.toISOString().split('T')[0]
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>