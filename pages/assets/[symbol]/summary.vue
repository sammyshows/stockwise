<template>
  <div>
    <div class="grid grid-cols-2 gap-x-4 mb-10">
      <div class="cols-span-1 flex justify-between"> <!-- Daily high -->
        <p class="text-tiny mb-0.5">High</p>
        <p class="text-tiny mb-0.5">{{ quote["high"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- 52 week high -->
        <p class="text-tiny mb-0.5">52wk High</p>
        <p class="text-tiny mb-0.5">{{ stats["week52high"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Daily low -->
        <p class="text-tiny mb-0.5">Low</p>
        <p class="text-tiny mb-0.5">{{ quote["low"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- 52 week low -->
        <p class="text-tiny mb-0.5">52wk Low</p>
        <p class="text-tiny mb-0.5">{{ stats["week52low"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Prev Close -->
        <p class="text-tiny mb-0.5">Prev Close</p>
        <p class="text-tiny mb-0.5">{{ quote["previousClose"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Market Cap -->
        <p class="text-tiny mb-0.5">Market Cap</p>
        <p class="text-tiny mb-0.5">{{ (parseInt(quote["marketCap"]) / 100000000).toFixed(2) || '-' }}M</p> <!-- May want to use a computed value here? -->
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Open -->
        <p class="text-tiny mb-0.5">Open</p>
        <p class="text-tiny mb-0.5">{{ quote["open"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Beta -->
        <p class="text-tiny mb-0.5">Beta</p>
        <p class="text-tiny mb-0.5">{{ parseFloat(stats["beta"]).toFixed(2) || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- P/E Ratio -->
        <p class="text-tiny mb-0.5">P/E</p>
        <p class="text-tiny mb-0.5">{{ quote["peRatio"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Fwd P/E Ratio -->
        <p class="text-tiny mb-0.5">Forward P/E</p>
        <p class="text-tiny mb-0.5">{{ (parseFloat(stats["forwardPERatio"])).toFixed(2) || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- EPS -->
        <p class="text-tiny mb-0.5">EPS</p>
        <p class="text-tiny mb-0.5">{{ stats["ttmEPS"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Volume -->
        <p class="text-tiny mb-0.5">Volume</p>
        <p class="text-tiny mb-0.5">{{ quote["volume"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- 1 Year Target -->
        <p class="text-tiny mb-0.5">EBITDA</p>
        <p class="text-tiny mb-0.5">{{ stats["EBITDA"] / 1000000000 || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Shares -->
        <p class="text-tiny mb-0.5">Shares</p>
        <p class="text-tiny mb-0.5">{{ stats["sharesOutstanding"] / 1000000 || '-' }}M</p> <!-- May want to use a computed value here so can choose to display in Thousands(K), Millions(M) or Billions(B) -->
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Price / Sales -->
        <p class="text-tiny mb-0.5">Price / Sales</p>
        <p class="text-tiny mb-0.5">{{ stats["priceToSales"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Price / Book -->
        <p class="text-tiny mb-0.5">Price / Book</p>
        <p class="text-tiny mb-0.5">{{ stats["priceToBook"] || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Price / Book -->
        <p class="text-tiny mb-0.5">Cash</p>
        <p class="text-tiny mb-0.5">{{ stats["totalCash"] / 1000000000 || '-' }}B</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Price / Book -->
        <p class="text-tiny mb-0.5">Debt</p>
        <p class="text-tiny mb-0.5">{{ stats["currentDebt"] / 1000000000 || '-' }}B</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Dividend Per Share -->
        <p class="text-tiny mb-0.5">Div Per Share</p>
        <p class="text-tiny mb-0.5">{{ (parseFloat(stats["ttmDividendRate"])).toFixed(2) || '-' }}</p>
      </div>
      <div class="cols-span-1 flex justify-between"> <!-- Dividend Yield -->
        <p class="text-tiny mb-0.5">Div Yield</p>
        <p class="text-tiny mb-0.5">{{ (stats["dividendYield"] * 100).toFixed(2) || '-' }}%</p>
      </div>
    </div>

    <h2 class="font-medium mb-2">RECENT FINANCIALS</h2>
    <div class="flex justify-between items-center px-1 py-2 border-t border-white hover:bg-gray-700 duration-300">
      <p class="text-xs">Income Statement</p>
      <SpeakerphoneIcon class="h-5 w-5 text-bright-cyan" />
    </div>
    <div class="flex justify-between items-center px-1 py-2 border-t border-white hover:bg-gray-700 duration-300">
      <p class="text-xs">Balance Sheet</p>
      <SpeakerphoneIcon class="h-5 w-5 text-bright-cyan" />
    </div>
    <div class="flex justify-between items-center mb-10 px-1 py-2 border-t border-b border-white hover:bg-gray-700 duration-300">
      <p class="text-xs">Cash Flow</p>
      <SpeakerphoneIcon class="h-5 w-5 text-bright-cyan" />
    </div>

    <button class="block mx-auto px-8 py-2 text-xl text-black bg-bright-cyan rounded-lg">Start a Study</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SpeakerphoneIcon } from "@heroicons/vue/solid"

export default defineComponent({
  name: "Asset Summary",

  components: {
    SpeakerphoneIcon
  },

  props: [
    "stats", "quote"
  ],

  computed: {
    price(): number | void {
      let number = parseFloat(this.quote["05. price"])
      if (number)
        return this.roundToThree(number)
    },

    change(): number | void {
      let number = parseFloat(this.quote["09. change"])
      if (number)
        return this.roundToThree(number)
    },

    margin(): number | void {
      let number = parseFloat(this.quote["10. change percent"])
      if (number)
        return this.roundToTwo(number)
    }
  },

  methods: {
    roundToTwo(num: number): number {
      return Math.round((num + Number.EPSILON) * 100) / 100
    },

    roundToThree(num: number): number {
      return Math.round((num + Number.EPSILON) * 1000) / 1000
    },
  }
})
</script>
