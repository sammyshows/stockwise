<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between mb-10 px-3">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div class="flex flex-col justify-between grow px-5">
      <div class="relative flex flex-col">
        <TransitionGroup name="form">
          <div v-if="!manualForm" class="w-full">
            <div class="relative mb-3" key="1">
              <input @keyup="fetchSearch($event.target.value)" autocomplete="off" type="text" name="search" placeholder="Find a company..." class="placeholder:text-sm placeholder:text-gray-400 placeholder:italic focus:ring-0 focus:border-white block bg-gray-500/20 w-full border-gray-600 rounded-md" />
              <div v-if="searchResults.length !== 0" class="absolute max-h-64 w-full overflow-scroll mt-0.5 divide-y divide-gray-700 bg-gray-700 border border-t-0 border-gray-600 rounded-b-lg z-10">
                <div v-for="result in searchResults" @click="fetchQuote(result.symbol)" class="flex justify-between items-center h-10 w-full px-3 gap-x-3">
                  <p class="w-2/5 whitespace-nowrap">{{ result.symbol + " : " + result.exchange }}</p>
                  <p class="w-2/5 text-right truncate">{{ result.securityName }}</p>
                </div>
              </div>
            </div>
            <div key="2" v-if="quote" class="w-full px-3 min-h-min">
              <div v-if="Object.keys(quote).length !== 0">
                <img v-if="['NASDAQ', 'NEW YORK STOCK EXCHANGE INC.', 'New York Stock Exchange'].includes(quote.primaryExchange)" class="h-11 mx-auto mb-2" :src="`https://storage.googleapis.com/iexcloud-hl37opg/api/logos/${quote.symbol}.png`" alt="">
                <p class="text-center truncate mb-1">{{ quote.companyName }}</p>
                <div class="flex text-xs">
                  <div class="w-1 grow text-right">
                    <p class="truncate">{{ quote.symbol }}</p>
                    <p class="truncate">Current price</p>
                    <p class="truncate">Daily movement</p>
                  </div>
                  <div class="w-3 text-center">
                    <p>:</p>
                    <p>:</p>
                    <p>:</p>
                  </div>
                  <div class="w-1 grow">
                    <p class="truncate">{{ quote.primaryExchange }}</p>
                    <p class="truncate">{{ quote.latestPrice }}</p>
                    <p class="truncate" :class="{ 'text-bright-red': quote.change < 0, 'text-bright-green': quote.change > 0 }">{{ $formatNumber(quote.change, 2, false, true) }} ({{ $formatNumber(quote.changePercent * 100, 2, false, true) }}%)</p>
                  </div>
                </div>
              </div>
              <Spinner class="h-32" v-else />
            </div>
          </div>

          <div v-else key="3" class="w-full">
            <p class="mb-2 px-6 text-xs text-center text-gray-400">Use the fields below to manually enter details for your study:</p>
            <div>
              <label for="name" class="flex items-end">Name</label>
              <input v-model="name" id="name" type="text" autocomplete="off" placeholder="e.g. Apple" class="w-full bg-transparent text-white border border-0 border-b placeholder:text-sm placeholder:italic focus:ring-0 focus:border-white text-sm">
            </div>

            <div class="mt-5">
              <label for="symbol" class="flex items-end">Symbol</label>
              <input v-model="symbol" id="symbol" type="text" autocomplete="off" placeholder="e.g. AAPL" class="w-full bg-transparent text-white border border-0 border-b placeholder:text-sm placeholder:italic focus:ring-0 focus:border-white text-sm">
            </div>
          </div>

          <div class="mt-5 text-sm" key="4">
            <label for="type" class="flex items-end">Study type</label>
            <select v-model="studyType" id="type" class="w-full bg-transparent text-white border border-0 border-b focus:ring-0 focus:border-gray-300 text-sm">
              <option value="" disabled selected hidden></option>
              <option :value="0">Standard</option>
              <option :value="1">Advanced</option>
            </select>
          </div>

  <!--        <p class="mt-5 text-tiny text-gray-300 text-center">-->
  <!--          Study a company by answering a series of questions about a company's performance in different areas.-->
  <!--          When you are finished a summary is created showing a compilation of your answers and key insights. The idea-->
  <!--          here is not to provide you with advice, but rather to give you an overall view of how you rate the company.-->
  <!--        </p>-->

          <button @click="toggleManual" key="5" class="w-max px-4 py-1 mt-10 rounded-lg border border-gray-400 bg-white/10 text-xs">{{ !manualForm ? "Can't find a company?" : "Search for a company" }}</button>
        </TransitionGroup>
      </div>
      <div class="text-right mb-7">
        <ButtonsCyan text="CREATE" @clicked="addStudy()" />
      </div>
    </div>
    <!--  this div below is used to "close" the search results box when a user clicks away  -->
    <div v-if="searchResults.length !== 0" @click="clearSearchResults" class="absolute top-0 left-0 bottom-14 right-0"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { v4 as uuidv4 } from 'uuid';
import { useStudies } from "@/store/studies";

export default defineComponent({
  name: "New Study",

  async setup() {
    const token = await useState('authToken').value
    const uuid = useState('uuid').value
    const studyStore = useStudies()
    return { token, uuid, studyStore }
  },

  mounted() {
    if (this.$route.params.assetSymbol)
      this.fetchQuote(this.$route.params.assetSymbol)
  },

  data() {
    return {
      pageDetails: {
        returnPath: '/studies',
        title: 'Start a Study'
      },
      manualForm: false,
      searchResults: [],
      quote: null as ({} | null),
      name: null as (string | null),
      symbol: null as (string | null),
      studyId: uuidv4(),
      studyType: 0
    }
  },

  methods: {
    async fetchSearch(searchTerm: string): Promise<void> {
      const data = await fetch('/api/stock-search', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          searchTerm: searchTerm
        })
      })
        .then(response => response.json())

      this.searchResults = data.data.slice(0,10)
    },

    async fetchQuote(symbol: string): Promise<void> {
      this.searchResults = []
      this.quote = {}
      const quote = await fetch('/api/stock-quote', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          symbol: symbol
        })
      })
        .then(response => response.json())
      this.quote = quote.data
    },

    clearSearchResults(): void {
      this.searchResults = []
    },

    toggleManual() {
      this.manualForm = !this.manualForm
    },

    async addStudy(): Promise<void> {
      const response = await fetch('/api/study-create', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          token: this.token,
          manualEntry: this.manualForm,
          uuid: this.uuid,
          studyId: this.studyId,
          name: this.manualForm ? this.name : null,
          symbol: this.manualForm ? this.symbol : this.quote.symbol,
          type: this.studyType
        })
      })
      if (response.status === 200) {
        this.studyStoreCreate()
        this.$router.push({ name: 'studies-study', params: {study: this.studyId }})
      }
    },

    studyStoreCreate() {
      this.studyStore.$patch((state) => {
        state.studies.push({
          completed_qs: 0,
          name: this.manualForm ? this.name : null,
          notes: null,
          question_eight: null,
          question_five: null,
          question_four: null,
          question_one: null,
          question_seven: null,
          question_six: null,
          question_three: null,
          question_two: null,
          study_id: this.studyId,
          symbol: this.manualForm ? this.symbol : this.quote.symbol,
          type: this.studyType
        })
      })
    }
  }
})
</script>

<style>
.form-move, /* apply transition to moving elements */
.form-enter-active {
  transition: all 0.5s ease;
}
.form-leave-active {
  transition: all 0.3s ease;
}

.form-enter-from {
  opacity: 0;
  transform: translate(30px, 0);
}
.form-leave-to {
  opacity: 0;
  transform: translate(30px, 0px);
}

.form-leave-active {
  position: absolute;
}
</style>
