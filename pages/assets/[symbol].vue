<template>
  <NuxtLayout name="page-container" activeButton="search">
    <div class="px-3 overflow-scroll">
      <div class="flex justify-between min-h-min">
        <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
<!--        <div>-->
<!--          <h2 class="text-lg">${{ quote["latestPrice"] }}</h2> &lt;!&ndash; Will probably need to use regex to round to 2 or 3 decimals &ndash;&gt;-->
<!--          <p class="text-xs text-bright-green font-medium whitespace-nowrap">{{ quote["change"] }} ({{ (quote["changePercent"] * 100).toFixed(2) }}%)</p>-->
<!--        </div>-->
        <img class="h-12 bg-transparent" :src="`https://storage.googleapis.com/iexcloud-hl37opg/api/logos/${symbol}.png`" alt="">
      </div>

      <div class="h-14 my-3 py-2 px-3 border-y border-gray-500 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
        <div class="flex justify-center items-center h-full">
          <h2 class="mr-2 font-normal text-lg tracking-wider truncate">${{ quote["latestPrice"] }}</h2>
          <p class="font-normal text-lg" :class="{ 'text-bright-red': 1 < 0, 'text-bright-green': 1 > 0 }">{{ $addSign($formatNumber(BigNumber(quote["change"]).toNumber()), 3) }} <span class="text-sm">({{ $addSign($formatNumber(BigNumber(quote["changePercent"]).times(100).toNumber()), 2) }}%)</span></p>
        </div>
      </div>

      <canvas ref="chart" id="myChart" width="400" height="300"></canvas>

      <div class="grid grid-cols-2 gap-x-4 mt-4 mb-6">
        <div class="cols-span-1 flex justify-between"> <!-- Daily high -->
          <p class="text-tiny mb-0.5">High</p>
          <p class="text-tiny mb-0.5">{{ quote["high"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- 52 week high -->
          <p class="text-tiny mb-0.5">52wk High</p>
          <p class="text-tiny mb-0.5">{{ stats["week52high"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Daily low -->
          <p class="text-tiny mb-0.5">Low</p>
          <p class="text-tiny mb-0.5">{{ quote["low"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- 52 week low -->
          <p class="text-tiny mb-0.5">52wk Low</p>
          <p class="text-tiny mb-0.5">{{ stats["week52low"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Prev Close -->
          <p class="text-tiny mb-0.5">Prev Close</p>
          <p class="text-tiny mb-0.5">{{ quote["previousClose"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Market Cap -->
          <p class="text-tiny mb-0.5">Market Cap</p>
          <p class="text-tiny mb-0.5">{{ (parseInt(quote["marketCap"]) / 100000000).toFixed(2) || '-' }}M</p> <!-- May want to use a computed value here? -->
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Open -->
          <p class="text-tiny mb-0.5">Open</p>
          <p class="text-tiny mb-0.5">{{ quote["open"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Beta -->
          <p class="text-tiny mb-0.5">Beta</p>
          <p class="text-tiny mb-0.5">{{ parseFloat(stats["beta"]).toFixed(2) || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- P/E Ratio -->
          <p class="text-tiny mb-0.5">P/E</p>
          <p class="text-tiny mb-0.5">{{ quote["peRatio"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Fwd P/E Ratio -->
          <p class="text-tiny mb-0.5">Forward P/E</p>
          <p class="text-tiny mb-0.5">{{ (parseFloat(stats["forwardPERatio"])).toFixed(2) || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- EPS -->
          <p class="text-tiny mb-0.5">EPS</p>
          <p class="text-tiny mb-0.5">{{ stats["ttmEPS"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Volume -->
          <p class="text-tiny mb-0.5">Volume</p>
          <p class="text-tiny mb-0.5">{{ quote["volume"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- 1 Year Target -->
          <p class="text-tiny mb-0.5">EBITDA</p>
          <p class="text-tiny mb-0.5">{{ stats["EBITDA"] / 1000000000 || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Shares -->
          <p class="text-tiny mb-0.5">Shares</p>
          <p class="text-tiny mb-0.5">{{ stats["sharesOutstanding"] / 1000000 || '-' }}M</p> <!-- May want to use a computed value here so can choose to display in Thousands(K), Millions(M) or Billions(B) -->
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Price / Sales -->
          <p class="text-tiny mb-0.5">Price / Sales</p>
          <p class="text-tiny mb-0.5">{{ stats["priceToSales"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Price / Book -->
          <p class="text-tiny mb-0.5">Price / Book</p>
          <p class="text-tiny mb-0.5">{{ stats["priceToBook"] || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Price / Book -->
          <p class="text-tiny mb-0.5">Cash</p>
          <p class="text-tiny mb-0.5">{{ stats["totalCash"] / 1000000000 || '-' }}B</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Price / Book -->
          <p class="text-tiny mb-0.5">Debt</p>
          <p class="text-tiny mb-0.5">{{ stats["currentDebt"] / 1000000000 || '-' }}B</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Dividend Per Share -->
          <p class="text-tiny mb-0.5">Div Per Share</p>
          <p class="text-tiny mb-0.5">{{ (parseFloat(stats["ttmDividendRate"])).toFixed(2) || '-' }}</p>
        </div>
        <div class="cols-span-1 flex justify-between"> <!-- Dividend Yield -->
          <p class="text-tiny mb-0.5">Div Yield</p>
          <p class="text-tiny mb-0.5">{{ (stats["dividendYield"] * 100).toFixed(2) || '-' }}%</p>
        </div>
      </div>

      <div class="flex px-4 mb-6 gap-x-6">
        <NuxtLink :to="{ name: 'studies-new', params: { assetSymbol: this?.quote.symbol } }" class="block grow mx-auto px-4 py-2 font-normal text-center border border-gray-400 bg-gray-900/50 rounded-lg">Add Holding</NuxtLink>
        <NuxtLink :to="{ name: 'studies-new', params: { assetSymbol: this?.quote.symbol } }" class="block grow mx-auto px-4 py-2 font-normal text-center border border-gray-400 bg-gray-900/50 rounded-lg">Start a Study</NuxtLink>
      </div>

      <h2 class="font-medium mb-2">RECENT FINANCIALS</h2>
      <div class="flex justify-between items-center px-1 py-2 border-t border-white hover:bg-gray-700 duration-300">
        <p class="text-xs">Income Statement</p>
        <SpeakerphoneIcon class="h-5 w-5 text-bright-cyan" />
      </div>
      <div class="flex justify-between items-center px-1 py-2 border-t border-white hover:bg-gray-700 duration-300">
        <p class="text-xs">Balance Sheet</p>
        <SpeakerphoneIcon class="h-5 w-5 text-bright-cyan" />
      </div>
      <div class="flex justify-between items-center mb-10 px-1 py-2 border-t border-b border-white hover:bg-gray-700 duration-300">
        <p class="text-xs">Cash Flow</p>
        <SpeakerphoneIcon class="h-5 w-5 text-bright-cyan" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import Chart from "chart.js/auto";
import BigNumber from "bignumber.js";
import { SpeakerphoneIcon } from "@heroicons/vue/solid"


interface StringObject {
  [index: string]: string;
}

export default defineComponent({
  name: "Asset Detail",

  async setup() {
    const token = await useState('authToken').value
    const chart = ref(null)

    return { token, chart }
  },

  mounted() {
    this.getChartData()
    this.fetchQuote()
    this.fetchStats()
  },

  data() {
    return {
      pageDetails: {
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: "/search",
      },
      symbol: this.$route.params.symbol,
      tabConfig: {
        activeTab: this.$route.name === 'assets-symbol-chart' ? 'CHART' : 'SUMMARY',
        tabs: [
          {name: 'SUMMARY', path: `/assets/${this.$route.params.symbol}/summary`},
          {name: 'CHART', path: `/assets/${this.$route.params.symbol}/chart`}
        ]
      },
      stats: {},
      quote: {} as StringObject
    }
  },

  methods: {
    async fetchQuote(): Promise<void> {
      const response = await fetch('/api/stock-quote', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
        .then(response => response.json())

      this.quote = response["data"]
      this.pageDetails.title = response.data.symbol
      this.pageDetails.subtitle = response.data.companyName
    },

    async fetchStats(): Promise<void> {
      const response = await fetch('/api/stock-stats', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: this.symbol
        })
      })
        .then(response => response.json())

      this.stats = response["data"]
    },

    async getChartData() {
      const chartData = await fetch('/api/iex-chart', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: this.$route.params.symbol
        })
      })
          .then(response => response.json())
          .then(response => response.data.slice(-1000))

      this.createChart(chartData)
    },

    createChart(chartData) {
      const prices = chartData.map(dailyData => dailyData.close)
      const labels = chartData.map(dailyData => dailyData.label)

      Chart.defaults.font.family = "Poppins"
      new Chart(this.chart, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Price',
            data: prices,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(0, 255, 187, 0.10)',
            fill: true
          }]
        },
        options: {
          scales: {
            x: {
              ticks: {
                maxTicksLimit: 10,
                color: 'rgb(175, 175, 175)',
                font: {
                  size: 8
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.07)'
              }
            },
            y: {
              ticks: {
                color: 'rgb(175, 175, 175)',
                font: {
                  size: 10
                }
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.07)'
              }
            }
          },
          interaction: {
            intersect: false,
            axis: 'x'
          },
          elements: {
            line: {
              borderWidth: 1
            },
            point: {
              radius: 0,
              hoverRadius: 6,
              hoverBackgroundColor: 'rgba(255,255,255, 0.5)',
              hoverBorderColor: 'rgba(255,255,255, 1)',
              hitRadius: 0
            }
          },
          plugins: {
            tooltip: {
              caretPadding: 20,
              displayColors: false
            },
            legend: {
              display: false
            }
          }
        }
      });
    },

    BigNumber
  }
})
</script>