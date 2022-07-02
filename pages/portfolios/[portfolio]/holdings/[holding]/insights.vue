<template>
  <div class="px-3 overflow-scroll">
    <div class="flex justify-center w-full h-8 pt-1 text-xs" :class="{ 'hidden': !assetChartMax }">
      <button v-for="range in ranges" @click="createChart(range.period, range.periodText, range.slice)" :disabled="activeRange === range.period" class="px-2 py-1" :class="{ 'bg-bright-cyan/20': activeRange === range.period }">{{ range.period }}</button>
    </div>

    <div :class="{ 'hidden': !assetChartMax }" class="mt-2 font-normal text-center text-sm">
      <p v-if="activeRange !== '1D'" :class="{ 'text-bright-red': BigNumber(assetData.current_price).minus(chartInitialPrice).toNumber() < 0, 'text-bright-green': BigNumber(assetData.current_price).minus(chartInitialPrice).toNumber() > 0 }">
        {{ $addSign($formatNumber(BigNumber(assetData.current_price).minus(chartInitialPrice).toNumber(), 3)) }} ({{ $addSign($formatNumber(BigNumber(assetData.current_price).minus(chartInitialPrice).div(chartInitialPrice).times(100).toNumber(), 2)) }}%)&nbsp; <span class="text-gray-500 text-xs">{{ activeText }}</span>
      </p>
      <p v-else-if="noDailyChart && activeRange === '1D'" class="text-gray-500">(Unavailabale during market hours)</p>
      <p v-else :class="{ 'text-bright-red': BigNumber(assetData.current_price).minus(assetData.prev_close).toNumber() < 0, 'text-bright-green': BigNumber(assetData.current_price).minus(assetData.prev_close).toNumber() > 0 }">
        {{ $addSign($formatNumber(BigNumber(assetData.current_price).minus(assetData.prev_close).toNumber(), 3)) }} ({{ $addSign($formatNumber(BigNumber(assetData.current_price).minus(assetData.prev_close).div(assetData.prev_close).times(100).toNumber(), 2)) }}%)&nbsp; <span class="text-gray-500 text-xs">{{ activeText }}</span>
      </p>
    </div>

    <div ref="chartContainer" id="chartContainer" :class="{ 'mr-2': !['5D', '1M'].includes(activeRange) }">
      <!--  This chart gets replaced on creation  -->
      <canvas ref="chart" id="initialChart" height="224" class="w-full" :class="{ 'hidden': !assetChartMax }" style="max-height: 218px; min-height: 218px; min-width: 100%;"></canvas>
    </div>

    <div v-if="!assetChartMax" style="height: 278px;">
      <Spinner></Spinner>
    </div>

    <div class="grid grid-cols-2 gap-x-4 mt-4 mb-6">
      <div class="cols-span-1 flex justify-between"> <!-- Daily high -->
        <p class="text-tiny mb-0.5">High</p>
        <p class="text-tiny mb-0.5">{{ quote?.["high"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- 52 week high -->
        <p class="text-tiny mb-0.5">52wk High</p>
        <p class="text-tiny mb-0.5">{{ stats?.["week52high"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Daily low -->
        <p class="text-tiny mb-0.5">Low</p>
        <p class="text-tiny mb-0.5">{{ quote?.["low"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- 52 week low -->
        <p class="text-tiny mb-0.5">52wk Low</p>
        <p class="text-tiny mb-0.5">{{ stats?.["week52low"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Prev Close -->
        <p class="text-tiny mb-0.5">Prev Close</p>
        <p class="text-tiny mb-0.5">{{ quote?.["previousClose"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Market Cap -->
        <p class="text-tiny mb-0.5">Market Cap</p>
        <p class="text-tiny mb-0.5">{{ (parseInt(quote?.["marketCap"]) / 100000000).toFixed(2) || '-' }}M</p> <!-- May want to use a computed value here? -->
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Open -->
        <p class="text-tiny mb-0.5">Open</p>
        <p class="text-tiny mb-0.5">{{ quote?.["open"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Beta -->
        <p class="text-tiny mb-0.5">Beta</p>
        <p class="text-tiny mb-0.5">{{ parseFloat(stats?.["beta"]).toFixed(2) || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- P/E Ratio -->
        <p class="text-tiny mb-0.5">P/E</p>
        <p class="text-tiny mb-0.5">{{ quote?.["peRatio"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Fwd P/E Ratio -->
        <p class="text-tiny mb-0.5">Forward P/E</p>
        <p class="text-tiny mb-0.5">{{ (parseFloat(stats?.["forwardPERatio"])).toFixed(2) || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- EPS -->
        <p class="text-tiny mb-0.5">EPS</p>
        <p class="text-tiny mb-0.5">{{ stats?.["ttmEPS"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Volume -->
        <p class="text-tiny mb-0.5">Volume</p>
        <p class="text-tiny mb-0.5">{{ quote?.["volume"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- 1 Year Target -->
        <p class="text-tiny mb-0.5">EBITDA</p>
        <p class="text-tiny mb-0.5">{{ stats?.["EBITDA"] / 1000000000 || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Shares -->
        <p class="text-tiny mb-0.5">Shares</p>
        <p class="text-tiny mb-0.5">{{ stats?.["sharesOutstanding"] / 1000000 || '-' }}M</p> <!-- May want to use a computed value here so can choose to display in Thousands(K), Millions(M) or Billions(B) -->
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Price / Sales -->
        <p class="text-tiny mb-0.5">Price / Sales</p>
        <p class="text-tiny mb-0.5">{{ stats?.["priceToSales"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Price / Book -->
        <p class="text-tiny mb-0.5">Price / Book</p>
        <p class="text-tiny mb-0.5">{{ stats?.["priceToBook"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Price / Book -->
        <p class="text-tiny mb-0.5">Cash</p>
        <p class="text-tiny mb-0.5">{{ stats?.["totalCash"] / 1000000000 || '-' }}B</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Price / Book -->
        <p class="text-tiny mb-0.5">Debt</p>
        <p class="text-tiny mb-0.5">{{ stats?.["currentDebt"] / 1000000000 || '-' }}B</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Dividend Per Share -->
        <p class="text-tiny mb-0.5">Div Per Share</p>
        <p class="text-tiny mb-0.5">{{ (parseFloat(stats?.["ttmDividendRate"])).toFixed(2) || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Dividend Yield -->
        <p class="text-tiny mb-0.5">Div Yield</p>
        <p class="text-tiny mb-0.5">{{ (stats?.["dividendYield"] * 100).toFixed(2) || '-' }}%</p>
      </div>
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
import Spinner from "~/components/Spinner.vue";

export default defineComponent({
  name: "Asset Detail",

  async setup() {
    const token = await useState('authToken').value
    const chartContainer = ref(null)
    const chart = ref(null)

    return { token, chartContainer, chart }
  },

  props: [
    'transactions', 'assetData', 'assetChartDay', 'assetChartMax', 'quote', 'stats'
  ],

  components: {
    Spinner,
    SpeakerphoneIcon
  },

  mounted() {
    if (this.assetChartDay) {
      this.createChart('1D', 'today')
    }
  },

  watch: {
    assetChartDay() {
      this.createChart('1D', 'today')
    }
  },

  data() {
    return {
      initialLoad: true,
      pageDetails: {
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: "/search",
      },
      activeRange: '1D',
      activeText: '',
      noDailyChart: false,
      chartInitialPrice: 0,
      chartFinalPrice: 0,
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
    }
  },

  methods: {
    createChart(range, periodText, dataSlice?) {
      this.activeRange = range
      this.activeText = periodText

      // Here we need to know whether this is the first time loading the chart because if the page is mounted and the data
      // has already been received and passed from the [holding] parent to this child, then the chart probably won't automatically
      // be loaded since the DOM hasn't loaded yet. However, I've placed a canvas element to begin so that it called with
      // $refs this first time.
      if (!this.initialLoad) // this checks that the DOM has loaded, since Vue mounted() doesn't technically.
        document.getElementById('chartContainer').innerHTML = `<canvas id="assetChart" height="224" class="w-full" style="max-height: 218px; min-height: 218px; min-width: 100%;"></canvas>`

      const chart = document.getElementById('assetChart') as HTMLCanvasElement || this.$refs.chart

      let chartData;
      let prices;
      if (range === '1D') { // The live day data is minute by minute and delivered by the api separately (assetChartDay) to historic (assetChartMax).
        chartData = this.assetChartDay

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
        chartData = this.assetChartMax.slice(dataSlice)
        prices = chartData.map(dailyData => dailyData.close)
      } else if (range === 'YTD') {
        const year = this.assetChartMax[this.assetChartMax.length - 1].date.slice(0,4)
        const firstOfYear = this.assetChartMax.findIndex(day => day.date.slice(0,4) === year)
        chartData = this.assetChartMax.slice(firstOfYear)
        prices = chartData.map(dailyData => dailyData.close)
      } else {
        chartData = this.assetChartMax
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

      this.canvas = new Chart(chart.getContext('2d'), {
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

      this.initialLoad = false
    },

    BigNumber
  }
})
</script>