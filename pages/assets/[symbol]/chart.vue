<template>
  <div>
    <h1>Chart</h1>
    <canvas ref="chart" id="myChart" width="400" height="400"></canvas>
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
        .then(response => response.data)

      this.createChart(chartData)
    },

    createChart(chartData) {
      const prices = chartData.map(dailyData => dailyData.close)
      const labels = chartData.map(dailyData => dailyData.label)

      new Chart(this.chart, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Stock price',
            data: prices,
            borderColor: 'rgb(75, 192, 192)'
          }]
        },
        options: {
          scales: {
            x: {
              ticks: {
                maxTicksLimit: 4
              }
            }
          },
          interaction: {
            intersect: false,
            axis: 'x'
          },
          elements: {
            point: {
              backgroundColor: 'rgba(0,0,0,0)',
              borderColor: 'rgba(0,0,0,0)',
              borderWidth: 0
            }
          }
        }
      });
    }
  }
})
</script>