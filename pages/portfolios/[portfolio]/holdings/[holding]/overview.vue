<template>
  <div class="px-3 overflow-scroll">
    <select v-model="chartType" @change="createChart(activeRange, activeText, activeSlice)" class="flex items-center w-max-c mx-auto mb-2.5 pb-0.5 text-lg bg-transparent border border-0 border-b focus:ring-0 focus:border-gray-300 border-gray-400">Total Value<span class="ml-2 mt-0.5 text-xs">&#9660;</span>
      <option value="current_value">Total Holding Value</option>
      <option value="initial_value">Initial Holding Value</option>
      <option value="all_time_change">All-time Change</option>
      <option value="all_time_percent">All-time Change (%)</option>
    </select>

    <div class="flex justify-center w-full h-8 pt-1 text-xs" :class="{ 'hidden': !overviewChart || overviewChart.length === 0  }">
      <button v-for="range in ranges" @click="createChart(range.period, range.periodText, range.slice)" :disabled="activeRange === range.period" class="px-2 py-1" :class="{ 'bg-normal-cyan': activeRange === range.period }">{{ range.period }}</button>
    </div>

    <p v-if="overviewChart && overviewChart.length === 0" class="grow flex items-center py-2 px-2 text-xs text-bright-cyan text-center">Your holding hasn't been saved long enough for any daily totals to be recorded yet</p>

    <p class="mt-2 font-normal text-center text-sm" :class="{ 'hidden': !chartInitialValue, 'text-bright-red': BigNumber(chartFinalValue).minus(chartInitialValue).toNumber() < 0, 'text-bright-green': BigNumber(chartFinalValue).minus(chartInitialValue).toNumber() > 0 }">
      {{ $formatNumber(BigNumber(chartFinalValue).minus(chartInitialValue).toNumber(), 3, false, true) }} <span v-if="chartType !== 'all_time_percent' && chartInitialValue > 0">({{ $formatNumber(BigNumber(chartFinalValue).minus(chartInitialValue).div(chartInitialValue).times(100).toNumber(), 2, false, true) }}%)</span>&nbsp;<span class="text-gray-500 text-xs">{{ activeText }}</span>
    </p>

    <div class="relative">
      <div ref="chartContainer" id="chartContainer" :class="{ 'hidden': !overviewChart, 'mr-2': !['5D', '1M'].includes(activeRange) }">
        <!--  This chart gets replaced on creation  -->
        <canvas ref="chart" id="initialChart" height="224" class="w-full" style="max-height: 218px; min-height: 218px; min-width: 100%;"></canvas>
      </div>

      <div v-if="overviewChart && overviewChart.length === 0" class="absolute top-1/3 w-full">
        <p class="w-max mx-auto py-3 px-5 rounded-lg bg-gray-600/40 text-xs text-gray-400 text-center">No data to display</p>
      </div>
    </div>

    <div v-if="!overviewChart" style="height: 250px;">
      <Spinner></Spinner>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";
import * as pkg from 'chart.js';
const { Chart, registerables } = pkg

import BigNumber from "bignumber.js";
import { SpeakerphoneIcon } from "@heroicons/vue/solid"
import { useAuth } from "@/store/auth";


interface StringObject {
  [index: string]: string;
}

export default defineComponent({
  name: "Asset Detail",

  async setup() {
    const chartContainer = ref(null)
    const chart = ref(null)
    const authStore = useAuth()

    return { chartContainer, chart, authStore }
  },

  props: ['transactions', 'total', 'overviewChart'],

  components: {
    SpeakerphoneIcon
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    if (this.overviewChart) {
      this.createChart('1W', 'past week', -7)
    }
  },

  watch: {
    overviewChart() {
      this.createChart('1W', 'past week', -7)
    }
  },

  data() {
    return {
      initialLoad: true,
      holdingId: this.$route.params.holding,
      activeRange: '',
      activeText: '',
      activeSlice: 0,
      chartInitialValue: 0,
      chartFinalValue: 0,
      chartType: 'current_value',
      ranges: [
        {
          period: '1W',
          slice: -7,
          periodText: 'past week'
        },
        {
          period: '1M',
          slice: -31,
          periodText: 'past month'
        },
        {
          period: '6M',
          slice: -183,
          periodText: 'past 6 months'
        },
        {
          period: 'YTD',
          periodText: 'year to date'
        },
        {
          period: '1Y',
          slice: -366,
          periodText: 'past year'
        },
        {
          period: '5Y',
          slice: -1826,
          periodText: 'past 5 years'
        },
        {
          period: 'MAX',
          periodText: 'all time'
        },
      ]
    }
  },

  methods: {
    createChart(range, periodText, dataSlice?) {
      Chart.register(...registerables);
      this.activeRange = range
      this.activeText = periodText
      this.activeSlice = dataSlice

      // Here we need to know whether this is the first time loading the chart because if the page is mounted and the data
      // has already been received and passed from the [holding] parent to this child, then the chart probably won't automatically
      // be loaded since the DOM hasn't loaded yet. However, I've placed a canvas element to begin so that it called with
      // $refs this first time.
      if (!this.initialLoad) // this checks that the DOM has loaded, since Vue mounted() doesn't technically.
        this.$refs.chartContainer.innerHTML = `<canvas id="overviewChart" height="224" class="w-full" style="max-height: 218px; min-height: 218px; min-width: 100%;"></canvas>`

      const chart = document.getElementById('overviewChart') as HTMLCanvasElement || this.$refs.chart

      const prices = this.configureChartData(range, dataSlice)
      this.chartInitialValue = prices[0]
      this.chartFinalValue = prices[prices.length - 1]

      const labels = this.overviewChart.slice(dataSlice).map(dailyData => dailyData.date.slice(0, 10))

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

      const chartType = this.chartType
      Chart.defaults.font.family = "Poppins"

      new Chart(chart.getContext('2d'), {
        plugins: [verticalLine],
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Price',
            data: prices,
            borderColor: (this.chartFinalValue - this.chartInitialValue) >= 0 ? 'rgb(75, 192, 192)': 'rgb(192, 75, 75)',
            backgroundColor: (this.chartFinalValue - this.chartInitialValue) >= 0 ? 'rgba(0, 255, 187, 0.10)' : 'rgba(255, 0, 0, 0.10)',
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
              callbacks: {
                label: function(context) {
                  let label = `${context.dataset.label}: ${context.formattedValue}`

                  if (chartType == 3)
                    label = label + '%'

                  return label
                }
              },
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

    configureChartData(range, dataSlice?) {
      let chartData;
      if (dataSlice) {
        chartData = this.overviewChart.slice(dataSlice)
        return chartData.map(data => parseFloat(data[this.chartType]).toFixed(2))
      } else if (range === 'YTD') {
        const year = this.overviewChart[this.overviewChart.length - 1].date.slice(0,4)
        const firstOfYear = this.overviewChart.findIndex(day => day.date.slice(0,4) === year)
        chartData = this.overviewChart.slice(firstOfYear)
        return chartData.map(data => parseFloat(data[this.chartType]).toFixed(2))
      } else {
        chartData = this.overviewChart
        return chartData.map(data => parseFloat(data[this.chartType]).toFixed(2))
      }
    },

    BigNumber
  }
})
</script>
