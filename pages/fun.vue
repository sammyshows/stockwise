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
      const data = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=B642KXFN4VUO0FC2`)
          .then(response => response.json())
          .then(quote => quote["Global Quote"])

      this.price = data
    }
  }
})
</script>
