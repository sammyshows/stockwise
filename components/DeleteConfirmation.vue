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
          <div class="modal-background relative inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle as="h3" class="text-lg leading-6 font-medium">{{ title }}</DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-400">{{ message }}</p>
                </div>
              </div>
              <div v-if="typeToConfirm">
                <p class="mt-2 text-xs text-center text-gray-400">Please type <span class="text-red-400">{{ typeToConfirm }}</span> to confirm:</p>
                <input @keyup="clickTest" v-model="textInput" type="text" placeholder="Please type your email to confirm" class="w-full mt-4 py-2.5 text-xs rounded-md bg-gray-900/20 border border-red-400/40 focus:ring-0 focus:border-red-500">
              </div>
            </div>
            {{ disabledDelete }}
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button type="button" :disabled="disabledDelete" style="touch-action: manipulation" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-500" @click="$emit('delete')">Delete</button>
              <button type="button" style="touch-action: manipulation" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm" @click="$emit('close', false)">Cancel</button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script lang="ts">
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ExclamationIcon } from '@heroicons/vue/outline'

export default {
  name: 'Delete Confirmation',

  components: {
    Dialog,
    DialogOverlay,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
    ExclamationIcon
  },

  props: [
    'open', 'title', 'message', 'typeToConfirm'
  ],

  data() {
    return {
      textInput: '',
      disabledDelete: true
    }
  },

  mounted() {
    this.clickTest()
  },

  methods: {
    clickTest(): void {
      console.log("Don't match?", this.textInput !== this.typeToConfirm)
      if (!!this.typeToConfirm)
        this.disabledDelete = this.textInput !== this.typeToConfirm
      else
        this.disabledDelete = false
    }
  }
}
</script>

<style scoped>
.modal-background {
  background: linear-gradient(195deg, rgba(25,25,25,1) 0%, rgba(33,33,33,1) 41%, rgba(65,70,70,1) 100%) no-repeat center top fixed;
}
</style>