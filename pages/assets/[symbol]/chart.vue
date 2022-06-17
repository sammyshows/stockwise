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

  setup() {
    const chart = ref(null)
    return { chart }
  },

  mounted() {
    new Chart(this.chart, {
      type: 'line',
      data: {
        labels: ['Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Feb'],
        datasets: [{
          label: 'My First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40],
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
        }
      }
    });
  }
})
</script>