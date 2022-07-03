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
      <p v-if="portfolios != null && portfolios.length === 0" class="grow flex items-center px-2 text-sm text-bright-cyan text-center">To begin tracking your investments, first use the "+" icon above to create a portfolio</p>
      <NuxtPage v-else-if="portfolios" :portfolios="portfolios" :overviewChart="overviewChart" :total="total" />
    </div>
    <NuxtPage v-else/>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PlusIcon } from "@heroicons/vue/solid";
import {BigNumber} from "bignumber.js";

export default defineComponent({
  name: "Portfolio Overview",

  async setup() {
    const token = await useState('authToken').value
    const uuid = useState('uuid').value
    return { token, uuid }
  },

  components: {
    PlusIcon
  },

  async mounted() {
    await this.getPortfolios()
    this.getOverviewChart()
    setInterval(this.getPortfolios(), 60000)

  },

  data() {
    return {
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
      portfolios: null as ([] | null),
      overviewChart: null as ([] | null)
    }
  },

  computed: {
    total() {
      if (this.portfolios) {
        return this.portfolios.reduce((total, { current_value, initial_value }) => {
              total.current_value = total.current_value.plus(current_value)
              total.initial_value = total.initial_value.plus(initial_value)

              return total
            },
            // This is the initial value, `total`, passed to reduce:
            {
              current_value: new BigNumber(0),
              initial_value: new BigNumber(0)
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
      this.portfolios = response.portfolios
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
      if (lastDate === this.currentDate()) {
        this.chartData.pop()
      }
      chartData.push({
        current_value: this.total.current_value.toNumber(),
        initial_value: this.total.initial_value.toNumber(),
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