<template>
  <div v-if="moreInfo" class="relative flex grow">
    <Transition name="question">
      <div v-if="!showMoreInfo" class="absolute flex flex-col grow w-full h-full px-3">
        <div v-html="moreInfo.title" class="h-1/2 flex items-end pb-8 text-2xl">
        </div>
        <div class="h-1/2">
          <div v-if="['question_six', 'question_seven'].includes(moreInfo.question)" class="h-14">
            <input v-model="value" @keyup="$emit('updateValue' ,moreInfo.question, this.value)" autocomplete="off" type="number" class="focus:ring-0 focus:border-white block bg-gray-500/20 w-32 border-gray-600 rounded-md tracking-wide" />
          </div>

          <div v-else class="h-14">
            <RadioGroup v-model="value" @click="$emit('updateValue' ,moreInfo.question, this.value)">
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

            <div class="flex justify-between px-0.5 mt-1">
              <p class="text-tiny">NOT VERY</p>
              <p class="text-tiny">VERY</p>
            </div>
          </div>

          <div @click="toggleMoreInfo" class="flex w-max mt-10">
            <p class="text-xs underline underline-offset-4 decoration-gray-400">HOW TO FIGURE THIS OUT</p>
            <ArrowNarrowRightIcon class="h-4 w-4 ml-2" />
          </div>
        </div>

        <div class="mb-7 flex justify-between">
          <button @click="$emit('prevPage')" :class="{ 'invisible': moreInfo.question === 'question_one' }" class="w-28 h-8 rounded-lg border border-gray-400 bg-white/10 text-xl">PREV</button>
          <button v-if="moreInfo.question !== 'question_eight'" @click="$emit('nextPage')" :disabled="!currentValue" :class="{ 'border-gray-500 text-gray-500': !currentValue }" class="w-28 h-8 rounded-lg border border-gray-400 border bg-white/10 text-xl">NEXT</button>
          <button v-else @click="$emit('submit')" :disabled="!currentValue" :class="{ 'border-gray-500 text-gray-500': !currentValue }" class="w-28 h-8 rounded-lg border border-gray-400 border bg-white/10 text-xl">SUBMIT</button>
        </div>
      </div>
    </Transition>

    <Transition name="info">
      <div v-if="showMoreInfo" class="absolute flex flex-col grow h-full pt-8">
        <div class="overflow-scroll h-5/6 flex flex-col gap-y-4 pb-4 text-xl">
          <div v-html="moreInfo.title" class="px-3"></div>
          <div v-html="moreInfo.info" class="px-3"></div>
        </div>
        <div class="h-1/6 px-3">
          <div @click="toggleMoreInfo" class="flex w-max mt-5">
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
      this.value = newNumber
    }
  },

  components: {
    RadioGroup, RadioGroupLabel, RadioGroupOption, ArrowNarrowRightIcon
  },

  data() {
    return {
      value: this.currentValue,
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
