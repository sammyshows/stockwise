<template>
  <div class="relative flex grow">
    <Transition name="question">
      <div v-if="!showMoreInfo" class="absolute flex flex-col grow w-full h-full px-3">
        <div v-html="moreInfo.title" class="h-1/2 flex items-end pb-8 text-2xl">
        </div>
        <div class="h-1/2">
          <div class="flex justify-between px-0.5 mt-1">
            <p class="text-tiny">NOT VERY</p>
            <p class="text-tiny">VERY</p>
          </div>
          <RadioGroup v-model="selectedNumber" @click="$emit('updateValue' ,moreInfo.question, this.selectedNumber)">
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

          <div @click="toggleMoreInfo" class="flex mt-10">
            <p class="text-xs underline underline-offset-4 decoration-gray-400">HOW TO FIGURE THIS OUT</p>
            <ArrowNarrowRightIcon class="h-4 w-4 ml-2" />
          </div>
        </div>

        <PrevNextButtons @prevPage="$emit('prevPage')" @nextPage="$emit('nextPage')" />
      </div>
    </Transition>

    <Transition name="info">
      <div v-if="showMoreInfo" class="absolute flex flex-col grow h-full px-3">
        <div v-html="moreInfo.title + moreInfo.info" class="h-4/5 flex flex-col gap-y-4 py-8 text-xl">
        </div>
        <div class="h-1/5">
          <div @click="toggleMoreInfo" class="flex mt-10">
            <ArrowNarrowRightIcon class="h-4 w-4 mr-2 rotate-180" />
            <p class="text-xs underline underline-offset-4 decoration-gray-400">BACK TO QUESTION</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue'
import { ArrowNarrowRightIcon } from '@heroicons/vue/outline';
import PrevNextButtons from "~/components/PrevNextButtons.vue";

export default defineComponent({
  name: "Question Standard Five",

  props: ['currentValue', 'moreInfo'],

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
      selectedNumber: this.currentValue,
      showMoreInfo: false
    }
  },

  methods: {
    toggleMoreInfo() {
      this.showMoreInfo = !this.showMoreInfo
    }
  }
})
</script>

<style scoped>
.question-enter-active, .question-leave-active {
  transition: 400ms ease-in-out;
}

.question-leave-to, .question-enter-from {
  transform: translateX(-360px);
}

.info-enter-active, .info-leave-active {
  transition: 400ms ease-in-out;
}

.info-enter-from, .info-leave-to {
  transform: translateX(360px);
}
</style>
