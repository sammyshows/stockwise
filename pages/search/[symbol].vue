<template>
  <div class="px-3 overflow-scroll">
    <div class="flex justify-between min-h-min">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <img v-if="['NASDAQ', 'NEW YORK STOCK EXCHANGE INC.', 'New York Stock Exchange'].includes(quote.primaryExchange)" class="h-11 text-tiny" :src="`https://storage.googleapis.com/iexcloud-hl37opg/api/logos/${symbol}.png`">
    </div>

    <div class="flex items-center h-20 mt-4 mb-1 py-3 px-3 border-y border-gray-500 bg-gray-900/30" style="box-shadow: 0 -5px 25px -20px rgb(75 85 99);">
      <div v-if="quote['latestPrice'] && chartDataDay">
        <p class="mr-2 font-normal text-2xl tracking-wider truncate">${{ $formatNumber(quote["latestPrice"], 2) }}</p>
        <p v-if="activeRange === '1D'" class="mt-1 font-normal text-sm" :class="{ 'text-bright-red': BigNumber(quote['change']).toNumber() < 0, 'text-bright-green': BigNumber(quote['change']).toNumber() > 0 }">
          {{ $addSign($formatNumber(BigNumber(quote["change"]).toNumber(), 3)) }} ({{ $addSign($formatNumber(BigNumber(quote["changePercent"]).times(100).toNumber(), 2)) }}%)&nbsp; <span class="text-gray-500 text-xs">{{ activeText }}</span>
        </p>
        <p v-else class="mt-1 font-normal text-sm" :class="{ 'text-bright-red': BigNumber(quote['latestPrice']).minus(chartInitialPrice).toNumber() < 0, 'text-bright-green': BigNumber(quote['latestPrice']).minus(chartInitialPrice).toNumber() > 0 }">
          {{ $addSign($formatNumber(BigNumber(quote["latestPrice"]).minus(chartInitialPrice).toNumber(), 3)) }} ({{ $addSign($formatNumber(BigNumber(quote["latestPrice"]).minus(chartInitialPrice).div(chartInitialPrice).times(100).toNumber(), 2)) }}%)&nbsp; <span class="text-gray-500 text-xs">{{ activeText }}</span>
        </p>
      </div>
      <Spinner class="h-20" v-else />
    </div>

    <div class="flex justify-center w-full h-8 pt-1 text-xs" :class="{ 'hidden': !chartDataDay }">
      <button v-for="range in ranges" @click="createChart(range.period, range.periodText, range.slice)" :disabled="activeRange === range.period" class="px-2 py-1" :class="{ 'bg-bright-cyan/20': activeRange === range.period }">{{ range.period }}</button>
    </div>

    <div class="relative">
      <div id="chartContainer" :class="{ 'mr-2': !['5D', '1M'].includes(activeRange) }">
        <!--  This chart gets replaced on creation  -->
        <canvas id="chart" height="224" class="w-full" :class="{ 'hidden': !chartDataDay }"></canvas>
      </div>
      <div v-if="this.noDailyChart && this.activeRange === '1D'" class="absolute top-1/3 w-full">
        <p class="w-max mx-auto py-3 px-5 rounded-lg bg-gray-600/40 text-xs text-gray-400 text-center">Unavailable during market hours</p>
      </div>
    </div>

    <div v-if="!chartDataDay" style="height: 250px;">
      <Spinner></Spinner>
    </div>

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
      <NuxtLink :to="{ name: 'studies-new', params: { assetSymbol: this?.quote.symbol } }" class="grow mx-auto px-4 py-2 font-normal text-center bg-bright-cyan/30 rounded-lg drop-shadow-md">Add Holding</NuxtLink>
      <NuxtLink :to="{ name: 'studies-new', params: { assetSymbol: this?.quote.symbol } }" class="grow mx-auto px-4 py-2 font-normal text-center bg-bright-cyan/30 rounded-lg drop-shadow-md">Start a Study</NuxtLink>
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

    return { token }
  },

  components: {
    SpeakerphoneIcon
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
      activeRange: '',
      activeText: '',
      noDailyChart: false,
      chartInitialPrice: 0,
      ranges: [
        {
          period: '1D',
          periodText: 'today'
        },
        {
          period: '5D',
          slice: -5,
          periodText: 'past week'
        },
        {
          period: '1M',
          slice: -22,
          periodText: 'past month'
        },
        {
          period: '6M',
          slice: -130,
          periodText: 'past 6 months'
        },
        {
          period: 'YTD',
          periodText: 'year to date'
        },
        {
          period: '1Y',
          slice: -260,
          periodText: 'past year'
        },
        {
          period: '5Y',
          slice: -1300,
          periodText: 'past 5 years'
        },
        {
          period: '15Y',
          periodText: 'past 15 years'
        },
      ],
      chartDataDay: null as ([] | null),
      chartDataMax: null as ([] | null),
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
          symbol: this.symbol
        })
      })
        .then(response => response.json())

      this.chartDataMax = chartData.max
      this.chartDataDay = chartData.day
      this.createChart('1D', 'today')
    },

    createChart(range, periodText, dataSlice?) {
      this.activeRange = range
      this.activeText = periodText

      document.getElementById('chart').remove()
      document.getElementById('chartContainer').innerHTML = `<canvas id="chart" height="224" class="w-full" style="max-height: 218px; min-height: 218px; min-width: 100%;"></canvas>`
      const chart = document.getElementById('chart') as HTMLCanvasElement

      let chartData;
      let prices;
      if (range === '1D') { // The live day data is minute by minute and delivered by the api separately (chartDataDay) to historic (chartDataMax).
        chartData = this.chartDataDay

        if (chartData.every(day => day.marketClose === undefined))
          this.noDailyChart = true

        const unfilteredPrices = chartData.map(dailyData => dailyData.marketClose)
        prices = unfilteredPrices.map((price, index) => {
          if (price === 0 && index !== 0)
            return unfilteredPrices[index - 1]
          else
            return price
        })
      } else if (dataSlice) {
        chartData = this.chartDataMax.slice(dataSlice)
        prices = chartData.map(dailyData => dailyData.close)
      } else if (range === 'YTD') {
        const year = this.chartDataMax[this.chartDataMax.length - 1].date.slice(0,4)
        const firstOfYear = this.chartDataMax.findIndex(day => day.date.slice(0,4) === year)
        chartData = this.chartDataMax.slice(firstOfYear)
        prices = chartData.map(dailyData => dailyData.close)
      } else {
        chartData = this.chartDataMax
        prices = chartData.map(dailyData => dailyData.close)
      }

      this.chartInitialPrice = chartData[0].close
      const labels = chartData.map(dailyData => dailyData.label)

      const verticalLine = {
        id: 'verticalLine',
        afterDraw: chart => {
          if (chart.tooltip?._active?.length) {
            let x = chart.tooltip._active[0].element.x;
            let yAxis = chart.scales.y;
            let ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      Chart.defaults.font.family = "Poppins"

      new Chart(chart.getContext('2d'), {
        plugins: [verticalLine],
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
                },
                padding: 8,
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.07)',
                drawTicks: false
              }
            },
            y: {
              position: 'left',
              ticks: {
                color: 'rgb(175, 175, 175)',
                font: {
                  size: 8
                },
                padding: 5
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.07)'
              }
            }
          },
          responsive: true,
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