<template>
  <div class="flex justify-between min-h-min px-3">
    <PageTitle :pageDetails="pageDetails" class="truncate" />
    <QuestionsStandardOne :answers="answers" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Portfolio Overview",

  mounted() {
    this.getStudy()
  },

  data() {
    return {
      pageDetails: {
        returnPath: '/studies',
        title: this.$route.params.assetSymbol,
        subtitle: 'STUDIES'
      },
      answers: {}
    }
  },

  methods: {
    async getStudy(): Promise<void> {
      const response = await fetch('/api/study-read', {
        method: 'GET'
      })
        .then(response => response.json())
      this.answers = response.data
      this.pageDetails.title = response.data.symbol
    },

    setActiveTab(newTab) {
      this.tabConfig.activeTab = newTab
    }
  }
})
</script>
