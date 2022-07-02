<template>
  <div class="px-3 overflow-scroll">
    <h2 class="w-max mx-auto mb-1.5 pb-0.5 text-xl text-center border-b border-gray-400">Holding Value</h2>

    <div class="flex justify-center w-full h-8 pt-1 text-xs" :class="{ 'hidden': !overviewChart || overviewChart.length === 0  }">
      <button v-for="range in ranges" @click="createChart(range.period, range.periodText, range.slice)" :disabled="activeRange === range.period" class="px-2 py-1" :class="{ 'bg-bright-cyan/20': activeRange === range.period }">{{ range.period }}</button>
    </div>

    <p v-if="overviewChart && overviewChart.length === 0" class="grow flex items-center py-2 px-2 text-xs text-bright-cyan text-center">Your holding hasn't been saved long enough for any daily totals to be recorded yet</p>

    <p class="mt-2 font-normal text-center text-sm" :class="{ 'hidden': !chartInitialValue, 'text-bright-red': total.current_value.minus(chartInitialValue).toNumber() < 0, 'text-bright-green': total.current_value.minus(chartInitialValue).toNumber() > 0 }">
      {{ $addSign($formatNumber(total.current_value.minus(chartInitialValue).toNumber(), 3)) }} ({{ $addSign($formatNumber(total.current_value.minus(chartInitialValue).div(chartInitialValue).times(100).toNumber(), 2)) }}%)&nbsp;<span class="text-gray-500 text-xs">{{ activeText }}</span>
    </p>

    <div ref="chartContainer" id="chartContainer" :class="{ 'hidden': !overviewChart, 'mr-2': !['5D', '1M'].includes(activeRange) }">
      <!--  This chart gets replaced on creation  -->
      <canvas ref="chart" id="initialChart" height="224" class="w-full"></canvas>
    </div>

    <div v-if="!overviewChart" style="height: 250px;">
      <Spinner></Spinner>
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
    const chartContainer = ref(null)
    const chart = ref(null)

    return { token, chartContainer, chart }
  },

  props: ['transactions', 'total', 'overviewChart'],

  components: {
    SpeakerphoneIcon
  },

  mounted() {
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
      chartInitialValue: 0,
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
      this.activeRange = range
      this.activeText = periodText

      // Here we need to know whether this is the first time loading the chart because if the page is mounted and the data
      // has already been received and passed from the [holding] parent to this child, then the chart probably won't automatically
      // be loaded since the DOM hasn't loaded yet. However, I've placed a canvas element to begin so that it called with
      // $refs this first time.
      if (!this.initialLoad) // this checks that the DOM has loaded, since Vue mounted() doesn't technically.
        this.$refs.chartContainer.innerHTML = `<canvas id="overviewChart" height="224" class="w-full" style="max-height: 218px; min-height: 218px; min-width: 100%;"></canvas>`

      const chart = document.getElementById('overviewChart') as HTMLCanvasElement || this.$refs.chart

      const prices = this.filterChartData(range, 'current_value', dataSlice)
      this.chartInitialValue = prices[0]

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

      this.initialLoad = false
    },

    filterChartData(range, dataType, dataSlice?) {
      let chartValues;
      if (dataSlice) {
        chartValues = this.overviewChart.slice(dataSlice)
        return chartValues.map(dailyData => dailyData[dataType])
      } else if (range === 'YTD') {
        const year = this.overviewChart[this.overviewChart.length - 1].date.slice(0,4)
        const firstOfYear = this.overviewChart.findIndex(day => day.date.slice(0,4) === year)
        chartValues = this.overviewChart.slice(firstOfYear)
        return chartValues.map(dailyData => dailyData[dataType])
      } else {
        chartValues = this.overviewChart
        return chartValues.map(dailyData => dailyData[dataType])
      }
    },

    BigNumber
  }
})
</script>
