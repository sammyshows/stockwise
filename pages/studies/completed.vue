<template>
  <div class="overflow-hidden flex flex-col grow">
    <div class="flex justify-end px-3 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-24 text-right ml-2">STUDY LEVEL</p>
      <p class="w-16 text-right ml-8"></p>
    </div>
    <div class="overflow-scroll flex flex-col grow px-3 divide-y divide-gray-700">
      <NuxtLink v-for="study in completedStudies" :to="{ name: 'studies-study', params: { study: study.id, assetName: study.name, currentQuestion: study.completed_qs + 1 } }">
        <div class="flex justify-end h-16 py-2">
          <div class="w-32 flex flex-col justify-around grow">
            <h2 class="text-bright-cyan font-bold tracking-wider truncate">{{ study.symbol }}</h2>
            <p class="font-light text-xs my-0.5 text-gray-300 truncate">{{ study.name }}</p>
          </div>
          <div class="w-20 flex items-center justify-end ml-2 font-normal">
            <p class="h-5 text-xs">{{ study.type === 0 ? 'STANDARD' : 'ADVANCED' }}</p>
          </div>
          <div class="w-16 ml-8 flex items-center font-normal">
            <p class="text-tiny underline underline-offset-4">VIEW REPORT</p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Studies",

  props: ['completedStudies']
})
</script>
