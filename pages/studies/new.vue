<template>
  <div class="h-full flex flex-col">
    <div class="flex justify-between h-14 mb-5 px-3">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
    </div>

    <div class="flex flex-col justify-between grow px-5 overflow-scroll">
      <div class="relative flex flex-col">
        <TransitionGroup name="form">
          <div v-if="!manualForm" class="w-full">
            <div class="mb-3" key="1">
              <p class="mb-1.5 ml-1 text-tiny leading-normal" :class="[ invalid.quote ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select a company</p>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 px-3 flex items-center pointer-events-none text-gray-600">
                  <SearchIcon class="h-7 w-7" aria-hidden="true" />
                </div>
                <input @keyup="fetchSearch($event.target.value); invalid.quote = false;" autocomplete="off" type="text" name="search" placeholder="Search for a company..." class="pl-12 placeholder:text-sm placeholder:text-gray-600 placeholder:italic focus:ring-0 focus:border-white block bg-gray-900/20 w-full border-gray-400/40 rounded-lg" />
                <div v-if="searchResults.length !== 0" class="absolute max-h-64 w-full overflow-scroll mt-0.5 divide-y divide-gray-700 bg-gray-700 border border-t-0 border-gray-600 rounded-b-lg z-10">
                  <div v-for="result in searchResults" @click="fetchQuote(result.symbol)" class="flex justify-between items-center h-10 w-full px-3 gap-x-3" style="touch-action: manipulation">
                    <p class="w-2/5 whitespace-nowrap">{{ result.symbol + " : " + result.exchange }}</p>
                    <p class="w-2/5 text-right truncate">{{ result.securityName }}</p>
                  </div>
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

          <div v-else key="3" class="w-full text-xs">
            <p class="mb-2 px-6 text-xs text-center text-gray-400">Use the fields below to manually enter details for your study:</p>
            <div>
              <label for="name" class="flex items-end">Name</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.name ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add the name of the company</p>
              <input v-model="name" @keyup="invalid.name = false" id="name" type="text" autocomplete="off" placeholder="e.g. Apple" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>

            <div class="mt-4">
              <label for="symbol" class="flex items-end">Symbol</label>
              <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.symbol ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add the symbol of the company</p>
              <input v-model="symbol" @keyup="invalid.symbol = false" id="symbol" type="text" autocomplete="off" placeholder="e.g. AAPL" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
            </div>
          </div>

          <div class="mt-4 text-xs" key="4">
            <label for="type" class="flex items-end">Study type</label>
            <select v-model="studyType" id="type" class="w-full mt-1.5 py-1.5 text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white" style="touch-action: manipulation">
              <option value="" disabled selected hidden></option>
              <option :value="0">Warren Buffett's Principles</option>
              <option :value="1" disabled>Coming soon...</option>
            </select>
            <p class="mt-1 text-tiny text-center text-gray-400">A study based on Warren Buffett's principles for investing.</p>
          </div>
          <button @click="toggleManual" key="5" style="touch-action: manipulation" class="w-max px-4 py-1 mt-5 rounded-lg border border-gray-400 bg-white/10 text-xs">{{ !manualForm ? "Can't find a company?" : "Search for a company" }}</button>

          <div key="5" class="mt-5 pt-5 border-t border-bright-cyan/40 text-gray-200">
            <h2 class="mb-1 text-xs">DISCLAIMER</h2>
            <p class="text-teeny line-height text-justify uppercase leading-3">
              The information contained in or provided from a study is not intended to be and does not constitute financial advice, investment advice, trading advice, or any other advice.
              The information within a study, from or through a study is general in nature and is not specific to you the User or anyone else.
              You should not make any decision, financial, investment, trading, or otherwise, based on any information presented in this app without undertaking independent due diligence and consultation with a professional broker or financial advisor.
            </p>
          </div>
        </TransitionGroup>
      </div>
      <div class="grow flex items-end justify-end my-7 text-right">
        <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'CREATING' : 'CREATE'" @clicked="addStudy()" />
      </div>
    </div>
    <!--  this div below is used to "close" the search results box when a user clicks away  -->
    <div v-if="searchResults.length !== 0" @click="clearSearchResults" class="absolute top-0 left-0 bottom-14 right-0" style="touch-action: manipulation"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { v4 as uuidv4 } from 'uuid';
import { SearchIcon } from '@heroicons/vue/solid'
import { useAuth } from "@/store/auth";
import { useUser } from "@/store/user";
import { useStudies } from "@/store/studies";

export default defineComponent({
  name: "New Study",

  async setup() {
    const authStore = useAuth()
    const userStore = useUser()
    const studyStore = useStudies()
    return { authStore, userStore, studyStore }
  },

  components: {
    SearchIcon
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.userId = this.userStore.userId
    if (this.$route.query.symbol)
      this.fetchQuote(this.$route.query.symbol)
  },

  data() {
    return {
      domain: useRuntimeConfig().DOMAIN,
      token: '',
      userId: '',
      disabledSave: false,
      pageDetails: {
        returnPath: '/studies',
        title: 'Start a Study'
      },
      manualForm: false,
      searchResults: [],
      invalid: {
        quote: false,
        name: false,
        symbol: false
      },
      quote: null as ({} | null),
      name: '' as (string | null),
      symbol: '' as (string | null),
      studyId: uuidv4(),
      studyType: 0
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.manualForm) {
        if (this.name === '')
          this.invalid.name = true
        if (this.symbol === '')
          this.invalid.symbol = true

        return this.invalid.name === false && this.invalid.symbol === false
      } else {
        if (!this.quote)
          this.invalid.quote = true

        return this.invalid.quote === false
      }
    },

    async fetchSearch(searchTerm: string): Promise<void> {
      const data = await fetch(this.domain + '/api/stock-search', {
        headers: {
          authorization: this.token
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
      const quote = await fetch(this.domain + '/api/stock-quote', {
        headers: {
          authorization: this.token
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
      this.disabledSave = true
      if (this.validateForm()) {
        const response = await fetch(this.domain + '/api/study-create', {
          headers: {
            authorization: this.token
          },
          method: 'POST',
          body: JSON.stringify({
            token: this.token,
            manualEntry: this.manualForm,
            uuid: this.userId,
            studyId: this.studyId,
            name: this.manualForm ? this.name : null,
            symbol: this.manualForm ? this.symbol : this.quote.symbol,
            type: this.studyType
          })
        })
        if (response.status === 200) {
          this.studyStoreCreate()
          await this.$router.push({name: 'studies-study', params: {study: this.studyId}})
        }
      }
      this.disabledSave = false
    },

    studyStoreCreate() {
      this.studyStore.$patch((state) => {
        state.studies.unshift({
          completed_qs: 0,
          name: this.manualForm ? this.name : this.quote.companyName,
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
