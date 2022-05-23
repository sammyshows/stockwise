<template>
  <div class="flex flex-col h-full px-3 pb-5 grow overflow-scroll">
    <div class="min-h-min flex justify-between pr-2">
      <PageTitle :pageDetails="pageDetails" class="truncate" />
      <TrashIcon @click="this.openModal = true" class="h-6 w-6 mt-0.75 mr-1 ml-3" />
    </div>

    <div class="mt-6 text-xs">
      <h2 class="mb-0.5">BUSINESS</h2>
      <div v-for="question in questions.slice(0, 4)" class="flex justify-between ml-8 pt-0.5">
        <p>{{ question.title }}</p>
        <p class="px-4 text-xs" :class="[{ 'text-bright-red': study?.[question.question] < 4, 'text-bright-yellow': study?.[question.question] >= 4 && study?.[question.question] <= 7, 'text-bright-green': study?.[question.question] > 7 }]">{{ study?.[question.question] }} </p>
      </div>

      <h2 class="mt-1 mb-0.5">MANAGEMENT</h2>
      <div v-for="question in questions.slice(4, 6)" class="flex justify-between ml-8 pt-0.5">
        <p>{{ question.title }}</p>
        <p class="px-4" :class="[{ 'text-bright-red': study?.[question.question] < 4, 'text-bright-yellow': study?.[question.question] >= 4 && study?.[question.question] <= 7, 'text-bright-green': study?.[question.question] > 7 }]">{{ study?.[question.question] }} </p>
      </div>

      <h2 class="mt-1 mb-0.5">FINANCIAL</h2>
      <div v-for="question in questions.slice(6, 8)" class="flex justify-between ml-8 pt-0.5">
        <p>{{ question.title }}</p>
        <p class="px-4" :class="[{ 'text-bright-red': study?.[question.question] < 1, 'text-bright-yellow': study?.[question.question] >= 1 && study?.[question.question] <= 1.5, 'text-bright-green': study?.[question.question] > 1.5 }]">{{ study?.[question.question] }} </p>
      </div>
    </div>

    <div class="flex items-center mt-6">
      <LightBulbIcon class="h-5 mr-3" />
      <h2>KEY INSIGHTS</h2>
    </div>
    <div class="mt-2 text-xs">
      <p>A low <span class="text-bright-red">{{ questions[1].title }}</span> often suggests that the company is still quite young and is yet to prove its long-term earnings capability</p>
      <p class="mt-2">A high <span class="text-bright-green">{{ questions[4].title }}</span> means that management is quite honest and transparent about the business which is important for maintaining trust with shareholders and consumers</p>
    </div>

    <div class="relative mt-6">
      <div class="flex items-center">
        <PencilAltIcon class="h-5 mr-3" />
        <h2>NOTES</h2>
      </div>
      <div class="mt-2 overflow-hidden">
        <label for="comment" class="sr-only">Add your notes</label>
        <textarea v-model="notes" rows="5" name="comment" id="comment" class="bg-transparent block w-full py-1 border border-gray-400 rounded-md focus:border-gray-300 resize-none focus:ring-0 text-xs" placeholder="Add notes..." />

        <!-- Spacer element to match the height of the toolbar -->
        <div v-if="study?.notes != notes" class="py-1" aria-hidden="true">
          <!-- Matches height of button in toolbar (1px border + 36px content height) -->
          <div class="py-px">
            <div class="h-9" />
          </div>
        </div>
      </div>

      <div v-if="study?.notes != notes" class="absolute bottom-0 right-0 pl-3 pr-2 py-2 flex justify-between">
        <div class="flex-shrink-0">
          <button @click="updateNotes" class="px-4 h-8 rounded-lg border border-gray-400 border bg-white/10 text-sm">SAVE</button>
        </div>
      </div>
    </div>

    <DeleteConfirmation :open="openModal"
                        title="Delete Study"
                        message="Are you sure you want to delete this study? This study and all progress will be deleted from our servers. This action cannot be undone."
                        @close="closeModal"
                        @delete="deleteStudy" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TrashIcon, LightBulbIcon, PencilAltIcon } from "@heroicons/vue/outline";

export default defineComponent({
  name: "Portfolio Overview",

  components: {
    TrashIcon, LightBulbIcon, PencilAltIcon
  },

  mounted() {
    this.getStudy()
  },

  data() {
    return {
      pageDetails: {
        returnPath: '/studies/completed',
        title: this.$route.params.assetName,
        subtitle: 'STUDIES'
      },
      studyId: this.$route.params.study,
      study: null as ({} | null),
      notes: null as (string | null),
      questions: [
        {
          question: 'question_one',
          title: 'Simplicity and Understandability'
        },
        {
          question: 'question_two',
          title: 'Operating History'
        },
        {
          question: 'question_three',
          title: 'Long-term Prospects'
        },
        {
          question: 'question_eight',
          title: 'Strength in Industry'
        },
        {
          question: 'question_four',
          title: 'Management Candor'
        },
        {
          question: 'question_five',
          title: 'Institutional Imperative Resistance'
        },
        {
          question: 'question_six',
          title: 'Return on Equity (ROE)'
        },
        {
          question: 'question_seven',
          title: 'Owner Earnings'
        }
      ],
      openModal: false
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
      this.notes = response.data.notes
    },

    async updateNotes() {
      this.study.notes = this.notes
      await fetch('/api/study-update', {
        method: 'POST',
        body: JSON.stringify({
          studyId: this.studyId,
          notes: this.notes,
          question_one: this.study.question_one,
          question_two: this.study.question_two,
          question_three: this.study.question_three,
          question_four: this.study.question_four,
          question_five: this.study.question_five,
          question_six: this.study.question_six,
          question_seven: this.study.question_seven,
          question_eight: this.study.question_eight
        })
      })

    },

    closeModal(): void {
      this.openModal = false
    },

    async deleteStudy(): Promise<void> {
      await fetch('/api/study-delete', {
        method: 'POST',
        body: JSON.stringify({
          studyId: this.studyId
        })
      })
        .then(this.$router.push('/studies/completed'))
    }
  }
})
</script>
