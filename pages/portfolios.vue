<template>
  <NuxtLayout name="page-container" activeButton="overview">
    <div v-if="viewPortfolios" class="flex flex-col grow overflow-hidden">
      <div class="flex justify-between min-h-min px-3">
        <PageTitle :pageDetails="pageDetails" class="truncate" />
        <NuxtLink :to="{ path: '/portfolios/new' }">
          <PlusIcon class="h-8 w-8" />
        </NuxtLink>
      </div>
      <NavigationTabs :tabConfig="tabConfig" @setActiveTab="setActiveTab" />
      <p v-if="displayMessage()" class="grow flex items-center px-2 text-sm text-bright-cyan text-center">To begin tracking your investments, first use the "+" icon above to create a portfolio</p>
      <NuxtPage v-else-if="portfolios"
                :show="viewPortfolios"
                :overviewChart="overviewChart"
                :total="total" />
    </div>
    <NuxtPage v-else
              @updatePortfolios="getPortfolios()" />
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";
import {BigNumber} from "bignumber.js";
import { storeToRefs } from 'pinia'
import { useUser } from "@/store/user.js";
import { usePortfolios } from "@/store/portfolios";


export default defineComponent({
  name: "Portfolio Overview",

  async setup() {
    const userStore = useUser()
    const portfolioStore = usePortfolios()
    const { portfolios } = storeToRefs(portfolioStore)
    const token = await useState('authToken').value
    const uuid = useState('uuid').value
    return { userStore, portfolioStore, portfolios, token, uuid }
  },

  components: {
    PlusIcon
  },

  async mounted() {
    await this.getPortfolios()
    this.getOverviewChart()
    this.intervalLoop = setInterval(() => this.getPortfolios(), 60000)
  },

  beforeUnmount() {
    clearInterval(this.intervalLoop)
  },

  data() {
    return {
      intervalLoop: null as (NodeJS.Timeout | null),
      pageDetails: {
        title: 'Portfolios Overview'
      },
      tabConfig: {
        activeTab: this.$route.name === 'portfolios-overview' ? 'OVERVIEW' : 'PORTFOLIOS',
        tabs: [
          { name: 'PORTFOLIOS', path: `/portfolios` },
          { name: 'OVERVIEW', path: `/portfolios/overview` }
        ]
      },
      overviewChart: null as ([] | null)
    }
  },

  computed: {
    total: function() {
      if (this.portfolios) {
        return this.portfolios.reduce((total, { current_value, initial_value, daily_change, all_time_initial, realized, realized_initial, portfolio_included }) => {
              if (portfolio_included) {
                if (current_value && initial_value && all_time_initial) {
                  total.current_value = total.current_value.plus(current_value)
                  total.initial_value = total.initial_value.plus(initial_value)
                  total.daily_change = total.daily_change.plus(daily_change)
                  total.all_time_initial = total.all_time_initial.plus(all_time_initial || initial_value)
                }

                if (realized) {
                  total.realized = total.realized.plus(realized)
                  total.realized_initial = total.realized_initial.plus(realized_initial)
                }
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

    viewPortfolios() {
      return [this.tabConfig.tabs[0].path, this.tabConfig.tabs[1].path].includes(this.$route.path)
    }
  },

  methods: {
    async getPortfolios(): Promise<void> {
      const response = await fetch('/api/portfolios-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          uuid: this.uuid
        })
      })
        .then(response => response.json())

      this.portfolioStore.$patch({
        portfolios: response.portfolios
      })

      if (response.portfolios[0]) {
        this.userStore.$patch({
          currency: response.portfolios[0].currency_symbol
        })
      }
    },

    async getOverviewChart() {
      let chartData = await fetch('/api/portfolios-data-read', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          userId: this.uuid,
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
      if (lastDate === this.currentDate())
        chartData.pop()

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

    displayMessage() {
      return this.$route.path === '/portfolios' && this.portfolios != null && this.portfolios.length === 0
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>