<template>
  <div v-if="show" class="overflow-hidden flex flex-col grow">
    <div class="flex justify-end px-3 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-24 text-right ml-2">STUDY LEVEL</p>
      <p class="w-16 text-right ml-8">QUESTION</p>
    </div>
    <div v-if="studies" class="overflow-scroll flex flex-col grow px-3 divide-y divide-gray-700">
      <TransitionGroup tag="div" name="form">
        <div v-for="study in studies" :key="study.study_id">
          <NuxtLink :to="{ name: 'studies-study', params: { study: study.study_id } }">
            <div class="flex justify-end py-2">
              <div class="w-32 flex flex-col justify-around grow">
                <h2 class="text-bright-cyan font-bold tracking-wider truncate">{{ study.symbol }}</h2>
                <p class="font-light text-xs my-0.5 text-gray-300 truncate">{{ study.name }}</p>
              </div>
              <div class="w-20 flex items-center justify-end ml-2 font-normal">
                <p class="h-5 text-xs">{{ study.type === 0 ? 'STANDARD' : 'ADVANCED' }}</p>
              </div>
              <div class="w-16 text-sm ml-8 font-normal">
                <div class="relative w-12 h-12 float-right rounded-full border border-bright-cyan">
                  <p class="absolute left-2.5 top-1">{{ study.completed_qs + 1 }}</p>
                  <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-0.5 -rotate-45 bg-gray-300"></div>
                  <p class="absolute right-2.5 bottom-1">{{ study.type === 0 ? '9' : '0' }}</p>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { computed } from "@vue/reactivity";
import { useStudies } from "@/store/studies";

export default defineComponent({
  name: "Studies",

  async setup() {
    const studyStore = useStudies()
    let studies = computed(() => studyStore.getUncompleted())
    return { studies }
  },

  props: ['show']
})
</script>
