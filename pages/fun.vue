<template>
  <h1>Well this is fun!</h1>
  <div class="h-20"></div>
  <p class="text-blue-500">AAPL price: {{ price }}</p>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "Fun",

  created() {
    this.fetchQuote()
  },

  data() {
    return {
      price: ""
    }
  },

  methods: {
    async fetchQuote() {
      const response = await fetch('/.netlify/functions/stock-quote', {
        method: 'POST',
        body: JSON.stringify({
          symbol: "AAPL"
        })
      })
        .then(response => response.json())

      this.price = response["data"]["05. price"]
    }
  }
})
</script>
