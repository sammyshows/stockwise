<template>
  <div class="flex flex-col justify-between min-h-min px-3 grow">
    <div class="min-h-min flex justify-between pr-2">
      <PageTitle :pageDetails="pageDetails" class="truncate" />

      <div :class="{ 'invisble': !study }" class="flex">
        <TrashIcon @click="this.openModal = true" class="h-6 w-6 mt-0.75 mr-5 ml-3" />
        <div class="relative w-12 h-12 float-right rounded-full border border-bright-cyan">
          <p class="absolute left-2.5 top-1">{{ currentQuestion }}</p>
          <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-0.5 -rotate-45 bg-white"></div>
          <p v-if="study" class="absolute right-2.5 bottom-1">{{ studyDetails.type === 0 ? '8' : '(Number of questions in an advanced study...)' }}</p>
        </div>
      </div>
    </div>

    <QuestionsStandard v-if="study" :currentValue="study[moreInfo[currentQuestion - 1].question]" :moreInfo="moreInfo[currentQuestion - 1]"
                       @updateValue="updateValue"
                       @prevPage="prevPage"
                       @nextPage="nextPage"
                       @submit="submit" />

    <DeleteConfirmation :open="openModal"
                        title="Delete Study"
                        message="Are you sure you want to delete this study? This study and all progress will be deleted from our servers. This action cannot be undone."
                        @close="closeModal"
                        @delete="deleteStudy" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TrashIcon } from "@heroicons/vue/outline";
import { useStudies } from "@/store/studies";

export default defineComponent({
  name: "Study Questions",

  async setup() {
    const studyStore = useStudies()
    const token = await useState('authToken').value
    return { studyStore, token }
  },

  components: {
    TrashIcon
  },

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
      study: null as ({} | null),
      studyDetails: null as ({} | null),
      currentQuestion: this.$route.params.currentQuestion,
      moreInfo: [
        {
          question: 'question_one',
          title: `<h2 class="font-medium text-bright-cyan">IS THE BUSINESS SIMPLE AND UNDERSTANDABLE?</h2>`,
          info: `<p class="text-xs">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
          <br><br>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>`
        },
        {
          question: 'question_two',
          title: `<h2 class="font-medium text-bright-cyan">HOW CONSISTENT IS THE OPERATING HISTORY OF THE BUSINESS?</h2>`,
          info: `<p class="text-xs">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
          <br><br>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>`
        },
        {
          question: 'question_three',
          title: `<h2 class="font-medium text-bright-cyan">HOW FAVOURABLE ARE THE LONG-TERM PROSPECTS OF THE BUSINESS?</h2>`,
          info: `<p class="text-xs">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
          <br><br>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>`
        },
        {
          question: 'question_four',
          title: `<h2 class="font-medium text-bright-cyan">IS MANAGEMENT CANDID WITH ITS SHAREHOLDERS?</h2>`,
          info: `<p class="text-xs">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
          <br><br>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>`
        },
        {
          question: 'question_five',
          title: `<h2 class="font-medium text-bright-cyan">HOW MUCH DOES MANAGEMENT RESIST THE INSTITUTIONAL IMPERATIVE?</h2>`,
          info: `<p class="text-xs">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
          <br><br>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>`
        },
        {
          question: 'question_six',
          title: `<h2 class="font-medium text-bright-cyan">CALCULATE THE RETURN ON EQUITY (ROE)</h2>`,
          info: `<p class="text-xs">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
          <br><br>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>`
        },
        {
          question: 'question_seven',
          title: `<h2 class="font-medium text-bright-cyan">CALCULATE OWNER EARNINGS</h2>`,
          info: `<p class="text-xs">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
          <br><br>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>`
        },
        {
          question: 'question_eight',
          title: `<h2 class="font-medium text-bright-cyan">HOW STRONG IS THE BUSINESS RELATIVE TO THE REST OF THE INDUSTRY?</h2>`,
          info: `<p class="text-xs">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
          <br><br>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>`
        }
      ],
      openModal: false
    }
  },

  methods: {
    async getStudy(): Promise<void> {
      const response = await fetch('/api/study-read', {
        headers: {
          authorization: 'Bearer ' + this.token
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
        question_eight: response.question_eight
      }
      this.studyDetails = {
        name: response.name,
        type: response.type,
        updatedDate: response.updatedDate
      }
      this.pageDetails.title = response.name
      this.currentQuestion = response.completed_qs + 1
    },

    updateValue(question, newValue) {
      this.study[question] = newValue
    },

    prevPage() {
      this.currentQuestion -= 1
    },

    nextPage() {
      this.currentQuestion += 1
    },

    async submit() {
      await this.updateStudy()
      await this.$router.push({ name: 'studies-study-summary',
        params: {
          studyId: this.studyId,
          assetName: this.studyDetails.name,
          updatedDate: this.studyDetails.updatedDate
        }
      })
    },

    async updateStudy(): Promise<void> {
      const response = await fetch('/api/study-update', {
        headers: {
          authorization: 'Bearer ' + this.token
        },
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
          authorization: 'Bearer ' + this.token
        },
        method: 'POST',
        body: JSON.stringify({
          studyId: this.studyId
        })
      })

      if (response.status === 200) {
        setTimeout(() => this.studyStoreDelete(), 600)
        this.$router.push('/studies')
      }
    },

    studyStoreUpdate() {
      let completedQs = Object.values(this.study).indexOf(null)
      if (completedQs === -1)
        completedQs = 8

      const updatedStudies = this.studyStore.studies.map(s => {
        if (s.study_id === this.studyId) {
          s.completed_qs = completedQs
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
