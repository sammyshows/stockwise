<template>
  <div v-if="show" class="overflow-hidden flex flex-col grow">
    <div class="flex justify-end px-3 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-24 text-right ml-2">STUDY LEVEL</p>
      <p class="w-16 text-right ml-8">SUBMITTED</p>
    </div>
    <div v-if="studies" class="overflow-scroll flex flex-col grow px-3 divide-y divide-gray-700">
      <TransitionGroup tag="div" name="form">
        <div v-for="study in studies" :key="study.study_id">
          <NuxtLink :to="{ name: 'studies-study-summary', params: { study: study.study_id, studyName: study.name, updatedDate: study.updated_date } }">
            <div class="flex justify-end h-16 py-2">
              <div class="w-32 flex flex-col justify-around grow">
                <h2 class="text-bright-cyan font-bold tracking-wider truncate">{{ study.symbol }}</h2>
                <p class="font-light text-xs my-0.5 text-gray-300 truncate">{{ study.name }}</p>
              </div>
              <div class="w-20 flex items-center justify-end ml-2 font-normal">
                <p class="h-5 text-xs">{{ study.type === 0 ? 'STANDARD' : 'ADVANCED' }}</p>
              </div>
              <div class="w-16 flex items-center justify-end ml-8 font-normal">
                <p class="h-5 text-xs">{{ study.updated_date }}</p>
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
  name: "Completed Studies",

  async setup() {
    const studyStore = useStudies()
    const studies = computed(() => studyStore.getCompleted())
    return { studies }
  },

  props: ['show']
})
</script>
