<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="fixed z-10 inset-0 overflow-y-auto" @close="$emit('close', false)">
      <div class="flex items-center justify-center min-h-screen py-4 px-4 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="modal-background relative w-full inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-normal-cyan sm:mx-0 sm:h-10 sm:w-10">
                <PencilIcon class="h-6 w-6 text-bright-cyan" aria-hidden="true" />
              </div>

              <div class="w-2/3 my-6 mx-auto text-sm">
                <label for="currentPrice" class="flex items-end">Current price</label>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.price ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add the current share price</p>
                <input @keyup="invalid.price = false" v-model="price" id="currentPrice" type="number" autocomplete="off" class="w-full h-10 mt-1.5 py-1.5 rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
              </div>

              <div class="w-2/3 my-6 mx-auto text-sm">
                <label for="currency" class="block">Local currency</label>
                <p class="mt-0.5 ml-1 text-tiny leading-normal" :class="[ invalid.currency ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please select the local currency of the stock</p>
                <select @change="invalid.currency = false" v-model="currency" id="currency" class="w-full h-10 mt-1.5 py-1.5 overflow-hidden truncate text-xs rounded-md bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
                  <option v-for="currency in currencies" :value="currency.ticker">{{ currency.ticker + ' - ' + currency.name }}</option>
                </select>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <ButtonsCyan :disabled="disabledSave" :text="disabledSave ? 'UPDATING' : 'UPDATE'" @clicked="updateAsset()" class="w-full flex justify-center text-base" style="padding: 0.5rem 0;" />
              <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm" @click="$emit('close', false)">CANCEL</button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { useAuth } from "@/store/auth";
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { PencilIcon } from '@heroicons/vue/outline'

export default {
  name: 'Update Custom Asset',

  setup() {
    const authStore = useAuth()

    return { authStore }
  },

  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    PencilIcon,
  },

  props: [
    'open', 'assetData'
  ],

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
  },

  data() {
    return {
      token: '',
      disabledSave: false,
      currencies: [
        { ticker: 'AUD', name: 'Australian Dollar' },
        { ticker: 'CAD', name: 'Canadian Dollar' },
        { ticker: 'CHF', name: 'Swiss Franc' },
        { ticker: 'CNH', name: 'Chinese Yuan Renminbi (HK)' },
        { ticker: 'CZK', name: 'Czech Koruna' },
        { ticker: 'DKK', name: 'Danish Krone' },
        { ticker: 'EUR', name: 'Euro' },
        { ticker: 'GBP', name: 'British Pound' },
        { ticker: 'HKD', name: 'Hong Kong Dollar' },
        { ticker: 'HUF', name: 'Hungarian Forint' },
        { ticker: 'ILS', name: 'Israeli New Shekel' },
        { ticker: 'INR', name: 'Indian Rupee' },
        { ticker: 'JPY', name: 'Japanese Yen' },
        { ticker: 'MXN', name: 'Mexican Peso' },
        { ticker: 'NOK', name: 'Norwegian Krone' },
        { ticker: 'NZD', name: 'New Zealand Dollar' },
        { ticker: 'PLN', name: 'Polish Zloty' },
        { ticker: 'RON', name: 'Romanian Leu' },
        { ticker: 'RUB', name: 'Russian Ruble' },
        { ticker: 'SEK', name: 'Swedish Krona' },
        { ticker: 'SGD', name: 'Singapore Dollar' },
        { ticker: 'THB', name: 'Thai Baht' },
        { ticker: 'TRY', name: 'Turkish Lira' },
        { ticker: 'USD', name: 'U.S. Dollar' },
        { ticker: 'ZAR', name: 'South African Rand' }
      ],
      invalid: {
        price: false,
        currency: false
      },
      price: this.assetData.current_price,
      currency: this.assetData.currency_symbol
    }
  },

  methods: {
    validateForm(): Boolean {
      if (this.price === null || this.price === '' || this.price < 0)
        this.invalid.price = true
      if (!this.currency)
        this.invalid.currency = true

      return this.invalid.price === false && this.invalid.currency === false
    },

    async updateAsset(): Promise<void> {
      this.disabledSave = true
      if (this.validateForm()) {
        const response = await fetch('/api/asset-custom-update', {
          headers: {
            authorization: this.token
          },
          method: 'POST',
          body: JSON.stringify({
            assetId: this.assetData.id,
            currentPrice: this.price,
            currency: this.currency
          })
        })

        if (response.status === 200) {
          this.$emit('updateTransactions')
        }
      }

      this.disabledSave = false
    }
  }
}
</script>

<style scoped>
.modal-background {
  background: linear-gradient(195deg, rgba(25,25,25,1) 0%, rgba(33,33,33,1) 41%, rgba(65,70,70,1) 100%) no-repeat center top fixed;
}
</style>