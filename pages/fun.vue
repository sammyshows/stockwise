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
      const response = await fetch('/.netlify/functions/price', {
        method: 'GET',
        body: JSON.stringify({
          symbol: "AAPL"
        })
      })
        .then(response => response.json())

      this.price = response
    }
  }
})
</script>
