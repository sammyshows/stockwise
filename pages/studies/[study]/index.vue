<template>
  <div class="flex flex-col justify-between min-h-min px-3 grow">
    <div class="min-h-min flex justify-between px-3">
      <PageTitle :pageDetails="pageDetails" class="truncate" />
      <div v-if="study" class="relative w-12 h-12 float-right rounded-full border border-bright-cyan">
        <p class="absolute left-2.5 top-1">{{ study.completed_qs + 1 }}</p>
        <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-0.5 -rotate-45 bg-white"></div>
        <p class="absolute right-2.5 bottom-1">{{ study.type === 0 ? '8' : '(Number of questions in an advanced study...)' }}</p>
      </div>
    </div>
    <QuestionsStandardOne :currentValue="study?.question_one" @updateValue="updateValue" />
    <div class="mb-7 flex justify-between">
      <button @click="prevPage" class="w-28 h-8 rounded-lg border border-gray-400 bg-white/10 text-xl">PREV</button>
      <button @click="nextPage" class="w-28 h-8 rounded-lg border border-gray-400 border bg-white/10 text-xl">NEXT</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Portfolio Overview",

  mounted() {
    this.getStudy()
  },

  beforeUnmount() {
    this.updateStudy()
  },

  data() {
    return {
      pageDetails: {
        returnPath: '/studies',
        title: this.$route.params.assetName,
        subtitle: 'STUDIES'
      },
      studyId: this.$route.params.study,
      study: null as ({} | null)
    }
  },

  methods: {
    async getStudy(): Promise<void> {
      const response = await fetch('/api/study-read', {
        method: 'POST',
        body: JSON.stringify({
          studyId: this.studyId
        })
      })
        .then(response => response.json())
      this.study = response.data
      this.pageDetails.title = response.data.name
    },

    updateValue(question, newValue) {
      this.study[question] = newValue
    },

    async updateStudy(): Promise<void> {
      await fetch('/api/study-update', {
        method: 'POST',
        body: JSON.stringify({
          studyId: this.studyId,
          question_one: this.study.question_one,
          question_two: this.study.question_two,
          question_three: this.study.question_three,
          question_four: this.study.question_four,
          question_five: this.study.question_five,
          question_six: this.study.question_six,
          question_seven: this.study.question_seven,
          question_eight: this.study.question_eight,
        })
      })
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>
