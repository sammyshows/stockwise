<template>
  <div v-if="storeStudy" class="flex flex-col justify-between min-h-min px-3 grow">
    <div class="min-h-min flex justify-between pr-2">
      <PageTitle :pageDetails="pageDetails" class="truncate" />

      <div class="flex">
        <TrashIcon @click="this.openModal = true" class="h-6 w-6 mt-0.75 mr-5 ml-3" />
        <div class="relative w-12 h-12 float-right rounded-full border border-bright-cyan">
          <p class="absolute left-2.5 top-1">{{ currentQuestion }}</p>
          <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-0.5 -rotate-45 bg-white"></div>
          <p class="absolute right-2.5 bottom-1">{{ studyDetails.type === 0 ? '8' : '(Number of questions in an advanced study...)' }}</p>
        </div>
      </div>
    </div>

    <QuestionsStandard v-if="storeStudy"
                       :currentValue="study[moreInfo[currentQuestion - 1]?.question]"
                       :moreInfo="moreInfo[currentQuestion - 1]"
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
import { computed } from "@vue/reactivity";

export default defineComponent({
  name: "Study Questions",

  async setup() {
    const route = useRoute()
    const studyStore = useStudies()
    const storeStudy = studyStore.getStudy(route.params.study)
    const token = await useState('authToken').value
    return { studyStore, storeStudy, token }
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
        title: this.storeStudy?.name,
        subtitle: 'STUDIES'
      },
      studyId: this.$route.params.study,
      studyDetails: {
        type: this.storeStudy?.type
      },
      study: {
        question_one: this.s?.question_one,
        question_two: this.storeStudy?.question_two,
        question_three: this.storeStudy?.question_three,
        question_four: this.storeStudy?.question_four,
        question_five: this.storeStudy?.question_five,
        question_six: this.storeStudy?.question_six,
        question_seven: this.storeStudy?.question_seven,
        question_eight: this.storeStudy?.question_eight
      },
      currentQuestion: this.storeStudy?.completed_qs + 1,
      moreInfo: [
        {
          question: 'question_one',
          title: `<h2 class="font-medium text-bright-cyan">IS THE BUSINESS SIMPLE AND UNDERSTANDABLE?</h2>`,
          info: `
          <div class="text-xs">
            <h2 class="font-medium mb-1 text-base text-bright-cyan">Circle of competence</h2>
            <p>When investing it is wise to define a "circle of competence" and stay within it. This is an area or industry that you understand quite well. It's important to understand how a business generates its revenue, cash flow, what influences the industry, and more.
            <br><br>For example a company like Coca Cola can be considered relatively easy to understand from a business point of view: they sell soft drinks. On the other hand insurance companies tend to have many products, and they can be quite complex.
            <br><br>With that in mind a couple things you can ask yourself are:
            <br><br>
            <ul class="px-5 text-xs list-disc">
              <li>Is this company in my circle of competence?</li>
              <li>Are the financials relatively simple or difficult to understand?</li>
            </ul>
            <br><h2 class="font-medium mb-1 text-base text-bright-cyan">Words from The Buff</h2>
            <span class="italic">“Everybody's got a different circle of competence. The important thing is not how big the circle is. The important thing is staying inside the circle.”</span> – Warren Buffett
            </p>
          </div>`
        },
        {
          question: 'question_two',
          title: `<h2 class="font-medium text-bright-cyan">HOW CONSISTENT IS THE OPERATING HISTORY OF THE BUSINESS?</h2>`,
          info: `
          <div class="text-xs">
            <p>Essentially what we're trying to answer here is whether the company has demonstrated consistent results selling the same product / service for years.
            <br><br>Many companies are quite young and have exciting plans for success in the space they operate in. Sometimes they hit the nail on the head, but a lot of the time they need to pivot for unforeseen circumstances. Alternatively, a business might be undergoing a radical change in their business model or leadership.
            <br><br>What many of these companies lack is a long, stable and consistent operating history that makes it not unreasonable to anticipate similar results in the years to come.
            <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">Words from The Buff</h2>
            <span class="italic">“To the extent that we have been successful, it is because we concentrated on identifying one-foot hurdles that we could step over rather than because we acquired any ability to clear seven-footers.”</span> – Warren Buffett
            <br><br>What Buffett means here is that his and Charlie Munger's success at Berkshire Hathaway isn't because they learnt how to solve big problems, rather because they learnt how to avoid them.
            </p>
          </div>`
        },
        {
          question: 'question_three',
          title: `<h2 class="font-medium text-bright-cyan">HOW FAVOURABLE ARE THE LONG-TERM PROSPECTS OF THE BUSINESS?</h2>`,
          info: `
          <div class="text-xs">
            <h2 class="font-medium mb-1 text-base text-bright-cyan">What to look for?</h2>
            <p>When considering the long-term prospects of a business, the product / service of the company is important. Consider whether the product / service of the company is:
            <br><br>
            <ul class="px-5 text-xs list-disc">
              <li>Needed or desired,</li>
              <li>Has no close substitute, and</li>
              <li>Is not highly regulated.</li>
            </ul>
            <br>Companies that possess the above traits have the pricing power to raise them without fears of losing market share, providing a greater return on capital. For example people still want to buy the new iPhone regardless of price increases. This creates what Buffett calls a 'moat' which gives the company a competitive advantage.
            <br><br>Be aware of companies that have large marketing expenditure but haven't achieved product differentiation. These are considered to have weak moats around them.
            <br><br>By lacking the competitive advantage of a differentiated product, they are often forced to compete on cost, which eats into their profit margins. These businesses tend to only yield good returns when there is a poor supply of their product / service, however, that is hard to predict.
            </p>
          </div>`
        },
        {
          question: 'question_four',
          title: `<h2 class="font-medium text-bright-cyan">IS MANAGEMENT RATIONAL?</h2>`,
          info: `<div class="text-xs"><p>Management is challenging to evaluate because humans are more complicated than numbers. However, management is very important to a company's success, so it is certainly worthwhile doing some analysis.
          <br><br>Managers must be rational in their decisions and allocate capital efficiently. If a company has extra cash and can produce an above-average return on equity (ROE), then the company should reinvest all of its extra earnings for further growth.
          <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">Rationality with low earnings</h2>
          On the contrary, if the company has unremarkable investment returns, they have a few options. This is where we can discern the rationality of management. They can:
          <br><br>
          <ul class="px-5 text-xs list-decimal">
            <li>Ignore it and reinvest their extra cash anyway,</li>
            <li>Acquire other companies, or</li>
            <li>Return excess cash to investors (dividends or share buybacks)</li>
          </ul>
          <br><span class="text-bright-cyan">Option 1: </span>This is the most common choice managers make - reinvest anyway, assuming the downturn is temporary and that they can increase profitability. However, if the problem persists, the company's cash pile will decline. In these periods, all eyes are on the earnings forecasts/reports.
          <br><br><span class="text-bright-cyan">Option 2: </span>It is understandable to have your eyebrows raised when a company must buy growth through acquisitions. In addition, it is often purchased at a premium price and integrating a new business is not easy.
          <br><br><span class="text-bright-cyan">Option 3: </span>Returning excess capital to investors is the most responsible option, if the company has a growing cash pile that can't be reinvested at above-average rates.
          <br><br>If a company has excess cash and a poor return on equity (ROE), it is reassuring to see management go with option 3.</p></div>`
        },
        {
          question: 'question_five',
          title: `<h2 class="font-medium text-bright-cyan">IS MANAGEMENT CANDID WITH ITS SHAREHOLDERS?</h2>`,
          info: `
          <div class="text-xs">
            <p>When considering the candour of management, look for honesty, transparency and genuine character.
            <br><br>Being candid with shareholders means being willing to speak on tough topics, providing clear explanations to hard questions and shareholder concerns and being open about their failures.
            <br><br>A good way to figure this out is to go through Annual Reports, CEO letters to shareholders, interviews, and anything else you can get your hands on from the CEO/management. Consider:
            <br><br>
            <ul class="px-5 text-xs list-disc">
              <li>Are they very transparent and forthcoming in good periods for the business, but reserved and uncommunicative in bad times?</li>
              <li>Are their past statements and strategies consistent with the current situation?</li>
              <li>Do they present clear and honest explanations when addressing shareholder concerns?</li>
            </ul>
            <br><h2 class="font-medium mb-1 text-base text-bright-cyan">Words from The Buff</h2>
            <span class="italic">“In evaluating people, you look for three qualities: integrity, intelligence, and energy. If you don’t have the first, the other two will kill you.” </span> – Warren Buffett
            </p>
          </div>`
        },
        {
          question: 'question_six',
          title: `<h2 class="font-medium text-bright-cyan">CALCULATE THE RETURN ON EQUITY (ROE)</h2>`,
          info: `
          <div class="text-xs">
            <p class="text-gray-400 italic">Calculating the ROE is more advanced and requires you to use a company's financials. If you prefer, you can likely find the ROE on the web and use that instead. Please note that the method used below has been adjusted to get a slightly different but more accurate view of the ROE.
            <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">ROE, not EPS?</h2>
            A lot of analysts like to use the earnings per share (EPS) to guage a company's performance. However, this doesn't give a clear picture of a company's performance since they tend to retain part of the previous year's earnings.
            <br><br>Since the denominator (shares) of EPS is generally static, it is not difficult to increase earnings each year since each year they have more capital to generate returns with.
            <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">Fair enough, so what's ROE?</h2>
            Return on equity (ROE) is a better measure of management's ability to generate a return on the shareholder's capital. Here's the formula:
            <br><br><div class="flex justify-center items-center px-3 py-2 text-base rounded-xl border border-bright-cyan/30">
              <h2>ROE =</h2>
              <div class="flex flex-col items-center ml-2 divide-y-2 divide-bright-cyan">
                <h2 class="px-3 pb-1">Net Income</h2>
                <h2 class="px-3 pt-1">Shareholder's Equity</h2>
              </div>
            </div>
            <br><span class="text-gray-400 italic">If either of these figures are negative (-), ROE will not be a useful metric and should not be calculated.</span>
            <br><br><span class="text-bright-cyan">Net Income </span>and <span class="text-bright-cyan">Shareholder's Equity </span>can be calculated using information available in a company's financial report. However, some adjustments must be made, so we can get a more accurate view of the ROE at the core.
            <br><br><ul class="px-5 text-xs list-decimal">
              <li>Marketable securities should be valued at cost instead of market value</li>
              <li>Exclude all capital gains, losses and extraordinary items which may affect operating earnings</li>
              <li>Ensure there is little or no significant debt</li>
            </ul>
            <br><h2 class="font-medium mb-1 text-base text-bright-cyan">What's wrong with debt?</h2>
            Nothing, necessarily. The third point concerning debt is due to the fact that a company can borrow money and use it to boost earnings (Net Income - numerator), hence boosting the ROE.
            <br><br>The problem is simply that having too much debt will diminish the value of calculating the ROE. If a company has a lot of debt it's worth considering why the company has borrowed so much, how it's being used etc.
            </p>
          </div>`
        },
        {
          question: 'question_seven',
          title: `<h2 class="font-medium text-bright-cyan">CALCULATE OWNER EARNINGS</h2>`,
          info: `<div class="text-xs"><p>A lot of analysts like to use the earnings per share (EPS) to guage a company's performance. However, this doesn't give a clear picture of a company's performance since they tend to retain part of the previous year's earnings.
          <br><br>Since the denominator (shares) of EPS is generally static, it is not difficult to increase earnings each year since each year they have more capital to generate returns with.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</div></p>`
        },
        {
          question: 'question_eight',
          title: `<h2 class="font-medium text-bright-cyan">HOW STRONG IS THE BUSINESS RELATIVE TO THE REST OF THE INDUSTRY?</h2>`,
          info: `<div class="text-xs"><p>A lot of analysts like to use the earnings per share (EPS) to guage a company's performance. However, this doesn't give a clear picture of a company's performance since they tend to retain part of the previous year's earnings.
          <br><br>Since the denominator (shares) of EPS is generally static, it is not difficult to increase earnings each year since each year they have more capital to generate returns with.
          <br><br>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</div></p>`
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

    studyUnchanged() {
      return this.storeStudy?.question_one === this.study.question_one && this.storeStudy?.question_two === this.study.question_two && this.storeStudy?.question_three === this.study.question_three && this.storeStudy?.question_four === this.study.question_four && this.storeStudy?.question_five === this.study.question_five && this.storeStudy?.question_six === this.study.question_six && this.storeStudy?.question_seven === this.study.question_seven && this.storeStudy?.question_eight === this.study.question_eight
    },

    async submit() {
      await this.updateStudy()
      await this.$router.push({ name: 'studies-study-summary', params: { studyId: this.studyId } })
    },

    async updateStudy(): Promise<void> {
      if (!this.studyUnchanged()) {
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

      let updatedStudies = this.studyStore.studies.map(s => {
        if (s.study_id === this.studyId) {
          s.completed_qs = completedQs
        }
        return s
      })

      updatedStudies.forEach((study, index) => {
        if(study.study_id === this.studyId){
          updatedStudies.splice(index, 1);
          updatedStudies.unshift(study);
        }
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
