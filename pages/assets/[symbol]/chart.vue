<template>
  <div>
    <canvas ref="chart" id="myChart" width="400" height="300"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Chart from 'chart.js/auto';

export default defineComponent({
  name: "Asset Chart",

  async setup() {
    const token = await useState('authToken').value
    const chart = ref(null)
    return { token, chart }
  },

  data() {
    return {
      symbol: this.$route.params.symbol
    }
  },

  mounted() {
    this.getChartData()
  },

  methods: {
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
                color: 'rgb(175, 175, 175)'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.07)'
              }
            },
            y: {
              ticks: {
                color: 'rgb(175, 175, 175)'
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
    }
  }
})
</script>