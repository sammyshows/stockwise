<template>
  <div class="overflow-hidden flex flex-col grow">
    <div class="flex justify-end px-3 text-xs text-gray-400">
      <p class="grow">NAME</p>
      <p class="w-24 text-right ml-2">STUDY LEVEL</p>
      <p class="w-16 text-right ml-8">PROGRESS</p>
    </div>
    <div class="overflow-scroll flex flex-col grow px-3 divide-y divide-gray-700">
      <NuxtLink v-for="study in uncompletedStudies" :to="{ name: 'studies-study', params: { study: study.id, assetName: study.name } }">
        <div class="flex justify-end py-2">
          <div class="flex flex-col justify-around grow">
            <h2 class="w-28 text-bright-cyan font-bold tracking-wider truncate">{{ study.symbol }}</h2>
            <p class="font-light text-xs my-0.5 text-gray-300 truncate">{{ study.name }}</p>
          </div>
          <div class="w-24 flex items-center justify-end ml-2 font-normal">
            <p class="h-5 text-xs">{{ study.type === 0 ? 'STANDARD' : 'ADVANCED' }}</p>
          </div>
          <div class="w-16 text-sm ml-8 font-normal">
            <div class="relative w-12 h-12 float-right rounded-full border border-bright-cyan">
              <p class="absolute left-2.5 top-1">{{ study.completed_qs }}</p>
              <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-0.5 -rotate-45 bg-white"></div>
              <p class="absolute right-2.5 bottom-1">{{ study.type === 0 ? '8' : '(Number of questions in an advanced study...)' }}</p>
            </div>
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

  props: ['uncompletedStudies']
})
</script>
