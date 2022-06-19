<template>
  <div class="px-3 overflow-scroll">
    <canvas ref="chart" height="224" class="w-full" :class="{ 'hidden': !chartData }"></canvas>
    <div v-if="!chartData" class="h-56">
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

  props: [
    'transactions', 'chartData', 'quote', 'stats'
  ],

  components: {
    Spinner,
    SpeakerphoneIcon
  },

  mounted() {
    if (this.chartData)
      this.createChart(this.chartData)
  },

  watch: {
    chartData(chartData) {
      this.createChart(chartData)
    }
  },

  data() {
    return {
      pageDetails: {
        title: this.$route.params.assetSymbol,
        subtitle: this.$route.params.assetName,
        returnPath: "/search",
      }
    }
  },

  methods: {
    createChart(chartData) {
      const prices = chartData.map(dailyData => dailyData.close)
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
      new Chart(this.chart, {
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
                padding: 8
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
                  size: 10
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