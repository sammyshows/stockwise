<template>
  <div class="px-3 overflow-scroll">
    <div class="flex justify-center w-full h-8 pt-1 text-xs" :class="{ 'hidden': !chartData }">
      <button v-for="range in ranges" @click="createChart(range.period, range.periodText, range.slice)" :disabled="activeRange === range.period" class="px-2 py-1" :class="{ 'bg-bright-cyan/20': activeRange === range.period }">{{ range.period }}</button>
    </div>

    <p class="mt-2 font-normal text-center text-sm" :class="{ 'hidden': !chartInitialValue, 'text-bright-red': total.current_value.minus(chartInitialValue).toNumber() < 0, 'text-bright-green': total.current_value.minus(chartInitialValue).toNumber() > 0 }">
      {{ $addSign($formatNumber(total.current_value.minus(chartInitialValue).toNumber(), 3)) }} ({{ $addSign($formatNumber(total.current_value.minus(chartInitialValue).div(chartInitialValue).times(100).toNumber(), 2)) }}%)&nbsp;<span class="text-gray-500 text-xs">{{ activeText }}</span>
    </p>

    <div id="chartContainer" :class="{ 'mr-2': !['5D', '1M'].includes(activeRange) }">
      <!--  This chart gets replaced on creation  -->
      <canvas id="chart" height="224" class="w-full" :class="{ 'hidden': !chartData }"></canvas>
    </div>

    <div v-if="!chartData" style="height: 250px;">
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
    const uuid = useState('uuid').value
    return { token, uuid }
  },

  props: ['portfolios'],

  components: {
    SpeakerphoneIcon
  },

  mounted() {
    this.getChartData()
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
          periodText: 'YTD'
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
      ],
      chartData: null as ([] | null)
    }
  },

  computed: {
    total: function() {
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

  methods: {
    async getChartData() {
      let chartData = await fetch('/api/user-portfolios-chart', {
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

      const lastDate = chartData[chartData.length - 1].date.slice(0, 10)
      if (lastDate === this.currentDate()) {
        this.chartData.pop()
      }
      chartData.push({
        current_value: this.total.current_value.toNumber(),
        initial_value: this.total.initial_value.toNumber(),
        date: this.currentDate()
      })

      this.chartData = chartData
      this.createChart('1W', 'past week', -7)
    },

    createChart(range, periodText, dataSlice?) {
      this.activeRange = range
      this.activeText = periodText

      document.getElementById('chart').remove()
      document.getElementById('chartContainer').innerHTML = `<canvas id="chart" height="224" class="w-full" style="max-height: 218px; min-height: 218px; min-width: 100%;"></canvas>`
      const chart = document.getElementById('chart') as HTMLCanvasElement

      const prices = this.filterChartData('current_value', dataSlice)
      this.chartInitialValue = prices[0]


      const labels = this.chartData.slice(dataSlice).map(dailyData => dailyData.date.slice(0, 10))

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

    filterChartData(dataType, dataSlice?) {
      let chartValues;
      if (dataSlice) {
        chartValues = this.chartData.slice(dataSlice)
        return chartValues.map(dailyData => dailyData[dataType])
      } else {
        chartValues = this.chartData
        return chartValues.map(dailyData => dailyData[dataType])
      }
    },

    currentDate() {
      // Get today's date in the local timezone
      let currentDate = new Date()
      const offset = currentDate.getTimezoneOffset()
      currentDate = new Date(currentDate.getTime() - (offset*60*1000))
      return currentDate.toISOString().split('T')[0]
    },

    BigNumber
  }
})
</script>
