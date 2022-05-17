<template>
  <div class="flex flex-col grow min-h-min px-3">
    <div class="h-1/2 flex items-end pb-8">
      <h2 class="text-2xl font-medium text-bright-cyan">HOW STRONG IS THE BUSINESS RELATIVE TO THE REST OF THE INDUSTRY?</h2>
    </div>
    <div class="h-1/2">
      <div class="flex justify-between px-0.5 mt-1">
        <p class="text-tiny">NOT VERY</p>
        <p class="text-tiny">VERY</p>
      </div>
      <RadioGroup v-model="selectedNumber" @click="$emit('updateValue' ,'question_eight', this.selectedNumber)">
        <RadioGroupLabel class="sr-only">Choose a number</RadioGroupLabel>
        <div class="flex rounded divide-x border border-gray-200">
          <RadioGroupOption as="template" v-for="number in 10" :value="number" v-slot="{ checked }">
            <div :class="[checked ? 'bg-bright-cyan text-black' : '', 'w-1/10 h-10 flex items-center justify-center border-gray-400 text-sm font-medium uppercase']">
              <RadioGroupLabel as="span">
                {{ number }}
              </RadioGroupLabel>
            </div>
          </RadioGroupOption>
        </div>
      </RadioGroup>

      <div class="flex mt-10">
        <p class="text-xs underline underline-offset-4 decoration-gray-400">HOW TO FIGURE THIS OUT</p>
        <ArrowNarrowRightIcon class="h-4 w-4 ml-2" />
      </div>
    </div>

    <PrevNextButtons @prevPage="$emit('prevPage')" @nextPage="$emit('nextPage')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import { ArrowNarrowRightIcon } from '@heroicons/vue/outline';

export default defineComponent({
  name: "Question Standard Eight",

  props: ['currentValue'],

  watch: {
    currentValue(newNumber) {
      this.selectedNumber = newNumber
    }
  },

  components: {
    RadioGroup, RadioGroupLabel, RadioGroupOption, ArrowNarrowRightIcon
  },

  data() {
    return {
      selectedNumber: this.currentValue
    }
  }
})
</script>
