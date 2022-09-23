<template>
  <div class="flex flex-col h-full px-3 pb-5 grow overflow-scroll">
    <div class="min-h-min flex justify-between pr-2">
      <PageTitle :pageDetails="pageDetails" class="truncate" />
      <TrashIcon @click="this.openModal = true" class="h-6 w-6 mt-0.75 mr-1 ml-3" />
    </div>

    <div class="mt-6 text-xs">
      <h2 class="mb-0.5">BUSINESS</h2>
      <div v-for="question in questions.slice(0, 4)" class="flex justify-between ml-8 pt-0.5">
        <p class="text-bright-cyan">{{ question.title }}</p>
        <p class="px-4 text-xs">{{ study?.[question.question] }}</p>
      </div>

      <h2 class="mt-1 mb-0.5">MANAGEMENT</h2>
      <div v-for="question in questions.slice(4, 6)" class="flex justify-between ml-8 pt-0.5">
        <p class="text-bright-cyan">{{ question.title }}</p>
        <p class="px-4">{{ study?.[question.question] }}</p>
      </div>

      <h2 class="mt-1 mb-0.5">FINANCIAL</h2>
      <div class="flex justify-between ml-8 pt-0.5">
        <p class="text-bright-cyan">{{ questions[6].title }}</p>
        <p class="px-4">{{ study?.[questions[6].question] }}</p>
      </div>
      <div v-for="question in questions.slice(7, 9)" class="flex justify-between ml-8 pt-0.5">
        <p class="text-bright-cyan">{{ question.title }}</p>
        <p class="px-4">{{ $simplify(study?.[question.question], 2) }}</p>
      </div>
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
        <div v-if="studyDetails.notes != notes" class="py-1" aria-hidden="true">
          <!-- Matches height of button in toolbar (1px border + 36px content height) -->
          <div class="py-px">
            <div class="h-9" />
          </div>
        </div>
      </div>

      <div v-if="studyDetails.notes != notes" class="absolute bottom-0 right-0 pl-3 pr-2 py-2 flex justify-between">
        <div class="flex-shrink-0">
          <button @click="updateNotes" class="px-4 h-8 rounded-lg border border-gray-400 border bg-white/10 text-sm">SAVE</button>
        </div>
      </div>
    </div>

    <div class="mt-5 pt-5 border-t border-bright-cyan/40 text-gray-400">
      <h2 class="mb-1 text-xs">DISCLAIMER</h2>
      <p class="text-teeny line-height text-justify uppercase leading-3">
        The information contained in or provided from a study or study summary is not intended to be and does not constitute financial advice, investment advice, trading advice, or any other advice.
        The information within, from or through a study or study summary is general in nature and is not specific to you the User or anyone else.
        You should not make any decision, financial, investment, trading, or otherwise, based on any information presented in this app, including this page, without undertaking independent due diligence and consultation with a professional broker or financial advisor.
      </p>
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
import { useStudies } from "@/store/studies";
import { useAuth } from "@/store/auth";

export default defineComponent({
  name: "Study Summary",

  async setup() {
    const route = useRoute()
    const authStore = useAuth()
    const studyStore = useStudies()
    const storeStudy = studyStore.getStudy(route.params.study)
    const token = await useState('authToken').value

    return { authStore, studyStore, storeStudy, token }
  },

  components: {
    TrashIcon, LightBulbIcon, PencilAltIcon
  },

  async mounted() {
    await this.$login()
    this.token = this.authStore.accessToken
    this.getStudy()
  },

  data() {
    return {
      pageDetails: {
        returnPath: '/studies/completed',
        title: this.storeStudy?.name,
        subtitle: 'STUDIES'
      },
      studyId: this.$route.params.study,
      studyDetails: {
        name: this.storeStudy?.name,
        type: this.storeStudy?.type,
        notes: this.storeStudy?.notes,
        updatedDate: this.storeStudy?.updated_date
      },
      study: {
        question_one: this.storeStudy?.question_one,
        question_two: this.storeStudy?.question_two,
        question_three: this.storeStudy?.question_three,
        question_four: this.storeStudy?.question_four,
        question_five: this.storeStudy?.question_five,
        question_six: this.storeStudy?.question_six,
        question_seven: this.storeStudy?.question_seven,
        question_eight: this.storeStudy?.question_eight,
        question_nine: this.storeStudy?.question_nine
      },
      notes: this.storeStudy?.notes,
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
          question: 'question_four',
          title: 'Strength in Industry'
        },
        {
          question: 'question_five',
          title: 'Institutional Imperative Resistance'
        },
        {
          question: 'question_six',
          title: 'Management Candor'
        },
        {
          question: 'question_seven',
          title: 'Return on Equity (%)'
        },
        {
          question: 'question_eight',
          title: 'Owner Earnings'
        },
        {
          question: 'question_nine',
          title: 'Company Value'
        },
      ],
      openModal: false,
    }
  },

  methods: {
    async getStudy(): Promise<void> {
      const response = await fetch('/api/study-read', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          studyId: this.studyId
        })
      })
        .then(response => response.json())
        .then(response => response.data)

      this.study = {
        question_one: response.question_one,
        question_two: response.question_two,
        question_three: response.question_three,
        question_four: response.question_four,
        question_five: response.question_five,
        question_six: response.question_six,
        question_seven: response.question_seven,
        question_eight: response.question_eight,
        question_nine: response.question_nine
      }
      this.studyDetails = {
        name: response.name,
        type: response.type,
        notes: response.notes,
        updatedDate: response.updatedDate
      }
      this.pageDetails.title = response.name
      this.notes = response.notes
    },

    async updateNotes() {
      this.studyDetails.notes = this.notes
      console.log(this.studyDetails.notes)
      const response = await fetch('/api/study-update', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          studyId: this.studyId,
          notes: this.studyDetails.notes,
          question_one: this.study.question_one,
          question_two: this.study.question_two,
          question_three: this.study.question_three,
          question_four: this.study.question_four,
          question_five: this.study.question_five,
          question_six: this.study.question_six,
          question_seven: this.study.question_seven,
          question_eight: this.study.question_eight,
          question_nine: this.study.question_nine
        })
      })

      if (response.status === 200) {
        this.studyStoreUpdate()
      }
    },

    closeModal(): void {
      this.openModal = false
    },

    async deleteStudy(): Promise<void> {
      const response = await fetch('/api/study-delete', {
        headers: {
          authorization: this.token
        },
        method: 'POST',
        body: JSON.stringify({
          studyId: this.studyId
        })
      })

      if (response.status === 200) {
        setTimeout(() => this.studyStoreDelete(), 600)
        this.$router.push('/studies/completed')
      }
    },

    studyStoreUpdate() {
      const updatedStudies = this.studyStore.studies.map(s => {
        if (s.study_id === this.studyId) {
          s.notes = this.notes
        }
        return s
      })
      this.studyStore.$patch({
        studies: updatedStudies
      })
    },

    studyStoreDelete() {
      this.studyStore.deleteStudy(this.studyId)
    }
  }
})
</script>
