<template>
  <h1>Well this is fun!</h1>
  <p>AAPL price: {{ price }}</p>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "Fun",

  created() {
    this.fetchPrice()
  },

  data() {
    return {
      price: ""
    }
  },

  methods: {
    async fetchPrice() {
      const response = await fetch('/api/price', {
        method: 'POST',
        body: JSON.stringify({
          symbol: "AAPL"
        })
      })
        .then(response => response.json())

      this.price = response["price"]["05. price"]
    }
  }
})
</script>
