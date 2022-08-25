<template>
  <div v-if="storeStudy" class="flex flex-col justify-between min-h-min px-3 grow">
    <div class="min-h-min flex justify-between pr-2">
      <PageTitle :pageDetails="pageDetails" class="truncate" />

      <div class="flex">
        <TrashIcon @click="this.openModal = true" class="h-6 w-6 mt-0.75 mr-5 ml-3" />
        <div class="relative w-12 h-12 float-right rounded-full border border-bright-cyan">
          <p class="absolute left-2.5 top-1">{{ currentQuestion }}</p>
          <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-0.5 -rotate-45 bg-white"></div>
          <p class="absolute right-2.5 bottom-1">{{ studyDetails.type === 0 ? '9' : '0' }}</p>
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
import { useAuth } from "@/store/auth";

export default defineComponent({
  name: "Study Questions",

  async setup() {
    const route = useRoute()
    const authStore = useAuth()
    const studyStore = useStudies()
    const storeStudy = studyStore.getStudy(route.params.study)
    return { authStore, studyStore, storeStudy }
  },

  components: {
    TrashIcon
  },

  async mounted() {
    await this.$login
    this.token = this.authStore.accessToken
    this.getStudy()
  },

  beforeUnmount() {
    this.updateStudy()
  },

  data() {
    return {
      token: '',
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
      currentQuestion: this.storeStudy?.completed_qs + 1,
      moreInfo: [
        {
          question: 'question_one',
          title: `<h2 class="font-medium text-bright-cyan">IS THE BUSINESS SIMPLE AND UNDERSTANDABLE?</h2>`,
          info: `
          <div class="text-xs">
            <h2 class="font-medium mb-1 text-base text-bright-cyan">Circle of competence</h2>
            <p>When investing, it is wise to define a "circle of competence" and stay within it. This is an areas or industries that an investor understands quite well. It's important to understand how a business generates its revenue, cash flow, what influences the industry, and more.
            <br><br>For example, a company like Coca Cola can be considered relatively easy to understand from a business point of view: they sell soft drinks. On the other hand, insurance companies tend to have many products, and they can be quite complex.
            <br><br>With that in mind, some things that investors tend to ask themselves about a company are:
            <br><br>
            <ul class="px-5 text-xs list-disc">
              <li>Is it in my circle of competence?</li>
              <li>Are its products / services offered complex?</li>
              <li>Does it focus on a few core products or have a large range?</li>
              <li>Is its business model relatively simple or difficult to understand?</li>
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
            <p>Essentially the way to answer this question is by determining whether the company has demonstrated consistent results selling the same product / service for years.
            <br><br>Many companies are quite young and have exciting plans for success in the space they operate in. Sometimes they hit the nail on the head, but a lot of the time they need to pivot for unforeseen circumstances. Alternatively, a business might be undergoing a radical change in their business model or leadership.
            <br><br>What many of these companies lack is a long, stable and consistent operating history that makes it not unreasonable to anticipate similar success in the years to come. Some questions investors tend to ask themselves are:
           <br><br>
            <ul class="px-5 text-xs list-disc">
              <li>Has the company been operating for 10+ years?</li>
              <li>Does they have a long history of profits?</li>
              <li>Has the current management / CEO been in the position for a long period?</li>
            </ul>
            <br><h2 class="font-medium mb-1 text-base text-bright-cyan">Words from The Buff</h2>
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
            <p>When considering the long-term prospects of a business, the product / service of the company is important. Some things investors tend to consider are whether the product / service of the company is:
            <br><br>
            <ul class="px-5 text-xs list-disc">
              <li>Needed or desired,</li>
              <li>Has no close substitute, and</li>
              <li>Is not highly regulated.</li>
            </ul>
            <br>Companies that possess the above traits have the pricing power to raise prices without fears of losing market share, providing a greater return on capital. For example people still want to buy the new iPhone regardless of price increases. This creates what Buffett calls a 'moat' which gives the company a competitive advantage.
            <br><br>Be aware of companies that have large marketing expenditure but haven't achieved product differentiation. These generally have weak moats around them.
            <br><br>By lacking the competitive advantage of a differentiated product, they are often forced to compete on cost, which eats into their profit margins. These businesses tend to only yield good returns when there is a poor supply of their product / service, however, that is hard to predict.
            </p>
          </div>`
        },
        {
          question: 'question_four',
          title: `<h2 class="font-medium text-bright-cyan">HOW STRONG IS THE BUSINESS RELATIVE TO THE REST OF THE INDUSTRY?</h2>`,
          info: `
          <div class="text-xs">
            <p>
              It is wise to compare the company to its peers in the industry. Being in the same industry they likely share the same market pressures and target the same consumers, so it's good to think about how the company fairs against them.
              <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">What to consider?</h2>
              Having a competitive advantage is crucial here because the company is competing for market share. The more competitors there are, the harder it is to capture that market share so having a strong competitive advantage is important to retaining that market share.
            </p>
          </div>`
        },
        {
          question: 'question_five',
          title: `<h2 class="font-medium text-bright-cyan">IS MANAGEMENT RATIONAL?</h2>`,
          info: `<div class="text-xs"><p>Management is challenging to evaluate because humans are more complicated than numbers. However, management is very important to a company's success, so it is certainly worthwhile doing some analysis.
          <br><br>Managers must be rational in their decisions and allocate capital efficiently. If a company has extra cash and can produce an above-average return on equity (ROE), then generally the company should reinvest all of its extra earnings for further growth.
          <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">Rationality with low earnings</h2>
          On the contrary, if the company has unremarkable investment returns, they have several options to go with. This is where we can discern the rationality of management. A few of the options they have are to:
          <br><br>
          <ul class="px-5 text-xs list-decimal">
            <li>Ignore it and reinvest their extra cash anyway,</li>
            <li>Acquire other companies, or</li>
            <li>Return excess cash to investors (dividends or share buybacks)</li>
          </ul>
          <br><span class="text-bright-cyan">Option 1: </span>This is the most common choice managers make - reinvest anyway, assuming the downturn is temporary and that they can increase profitability. However, if the problem persists, the company's cash pile will decline. In these periods, all eyes are on the earnings forecasts/reports.
          <br><br><span class="text-bright-cyan">Option 2: </span>It is understandable to have your eyebrows raised when a company must buy growth through acquisitions. In addition, the company is often purchased at a premium price and integrating a new business is not easy.
          <br><br><span class="text-bright-cyan">Option 3: </span>Returning excess capital to investors is often the most responsible option, if the company has a growing cash pile that can't be reinvested at above-average rates.
          <br><br>If a company has excess cash and a poor return on equity (ROE), it is often reassuring to see management go with option 3.</p></div>`
        },
        {
          question: 'question_six',
          title: `<h2 class="font-medium text-bright-cyan">IS MANAGEMENT CANDID WITH ITS SHAREHOLDERS?</h2>`,
          info: `
          <div class="text-xs">
            <p>When considering the candour of management, investors often look for honesty, transparency and genuine character.
            <br><br>Being candid with shareholders means being willing to speak on tough topics, providing clear explanations to hard questions and shareholder concerns and being open about their failures.
            <br><br>A good way to figure this out is to go through Annual Reports, CEO letters to shareholders, interviews, and anything else you can get your hands on from the CEO/management. Some things investors can consider about management are:
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
          question: 'question_seven',
          title: `<h2 class="font-medium text-bright-cyan">CALCULATE THE RETURN ON EQUITY (ROE)</h2>`,
          info: `
          <div class="text-xs">
            <span class="text-gray-400 italic">Calculating the ROE is relatively advanced and requires you to use a company's financials. If you prefer, you can likely find the ROE on the web and use that instead. Please note that the method used below has been adjusted to get a slightly different but more accurate view of the ROE.            </span>
            <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">ROE, not EPS?</h2>
            A lot of analysts like to use the earnings per share (EPS) to guage a company's performance. However, this doesn't give a clear picture of a company's performance since they tend to retain part of the previous year's earnings.
            <br><br>Since the denominator (number of shares) of EPS is generally static, it is not difficult to increase earnings each year since each year they have more capital to generate returns with.
            <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">Fair enough, so what's ROE?</h2>
            Return on equity (ROE) is a better measure of management's ability to generate a return on the shareholder's capital. Here's the formula:
            <br><br><div class="flex justify-center items-center px-3 py-2 text-sm rounded-xl border border-bright-cyan/30">
              <h2>ROE (%) =</h2>
              <div class="flex flex-col items-center px-2 divide-y-2 divide-bright-cyan">
                <h2 class="px-2 pb-1">Net Income</h2>
                <h2 class="px-2 pt-1">Shareholder's Equity</h2>
              </div>
              <h2> x 100</h2>
            </div>
            <br><span class="text-gray-400 italic">If either of these figures are negative (-), ROE will not be a useful metric and should not be calculated.</span>
            <br><br><span class="text-bright-cyan">Net Income </span>can be found in a company's annual report's cash flow statement.
            <br><span class="text-bright-cyan">Shareholder's Equity </span>can be found in a company's annual report's balance sheet and can be calculated as (Total assets - Total liabilities).
            <br><br>However, some adjustments must be made, so investors can get a more accurate view of the ROE at the core.
            <br><br><ul class="px-5 text-xs list-decimal">
              <li>Marketable securities should be valued at cost instead of market value</li>
              <li>Exclude all capital gains, losses and extraordinary items which may affect operating earnings</li>
              <li>Ensure there is little or no significant debt</li>
            </ul>
            <br><h2 class="font-medium mb-1 text-base text-bright-cyan">What's wrong with debt?</h2>
            Nothing, necessarily. Sometimes taking on debt can be a good idea when used wisely. The third point concerning debt is due to the fact that a company can borrow money and use it to boost earnings (numerator), hence boosting the ROE.
            <br><br>The problem is simply that having too much debt will diminish the value of calculating the ROE. If a company has a lot of debt it's worthwhile for investors to consider why the company has borrowed so much, how it's being used etc. - good businesses should be able to generate a decent return on equity without debt.
            <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">I have the ROE, what now?</h2>
            A high ROE should suggest the company is utilizing its equity capital well (assuming they have little to no debt). Look at previous years - a rising ROE indicates that the company is generating more profits without deploying as much capital.
            <br><br>As for what a 'high' or 'low' ROE is, the industry the company is in should be used to define these. Investors can compare the return on equity to others in the same industry and see how it fairs. If the industry standard is around 11.5% and a company in that sector has an ROE of 15%, then it is generally fair to suggest that management is doing a good job of generating profits off of its equity capital.
          </div>`
        },
        {
          question: 'question_eight',
          title: `<h2 class="font-medium text-bright-cyan">CALCULATE OWNER EARNINGS</h2>`,
          info: `
          <div class="text-xs">
            <p class="text-gray-400 italic">Calculating Owner Earnings is more advanced and requires you to use a company's financials. If you prefer, you can likely find the 'Free Cash Flow' on the web and use that instead, which is similar.</p>
            <br><h2 class="font-medium mb-1 text-base text-bright-cyan">Why owner earnings?</h2>
            'Owner earnings' is a term introduced by Berkshire Hathaway in its letter to shareholders in 1986. It can be used instead of cash flow to get a more clear picture of a company's value.
            <br><br>It's a measure of a company's ability to generate cash over a period of time. What makes it a useful metric is that, unlike operating cash flow, it accounts for the capital expenditures required by the business to continue operating at the same level.
            <br><br>Owner earnings can be considered as the amount of profits that's left over after the costs of generating the capital have been deducted. It's essentially the amount of money that could be returned to shareholders without harming the health of the business.
            <br><br>
            <div class="px-3 py-2 text-sm rounded-xl border border-bright-cyan/30">
                <h2 class="font-medium mb-1 text-base text-bright-cyan">Owner earnings formula</h2>
              <p><span class="invisible">+ </span>Net income</p>
              <div class="flex"><p class="text-bright-cyan">+&nbsp;</p><p>Deprecitation, Amortization and other non-cash charges</p></div>
              <div class="flex"><p class="text-bright-cyan">-&nbsp;</p><p>Capital expenditure (CAPEX)</p></div>
              <div class="flex"><p class="text-bright-cyan">+&nbsp;</p><p>Change in working capital</p></div>
            </div>
            <br><span class="text-bright-cyan">Net Income </span>can be found in a company's annual report's cash flow statement.
            <br><span class="text-bright-cyan">Depreciation, Amortization and other non-cash charges </span>can be found in a company's annual report's cash flow statement. Share-based compensation is another common non-cash charge.
            <br><span class="text-bright-cyan">Capital expenditure (CAPEX) </span>refers to the property, plant and equipment expense found in the investment activities section of a company's annual report's cash flow statement.
            <br><span class="text-bright-cyan">Change in working capital </span>refers to the change in capital over a period that is available to the company in the short term i.e. current assets, found in a company's annual report's balance sheet.
            <br><br><h2 class="font-medium mb-1 text-base text-bright-cyan">Words from The Buff</h2>
            <span class="italic">“Calculate 'owner earnings' to get a true reflection of value.”</span> – Warren Buffett
          </div>`
        },
        {
          question: 'question_nine',
          title: `<h2 class="font-medium text-bright-cyan">WHAT IS THE VALUE OF THE BUSINESS?</h2>`,
          info: `
          <div class="text-xs">
            <div class="px-3 py-2 text-xs rounded-xl border border-bright-cyan/30">
              <span class="italic">“The value of a business is the present value of all the future cash flows expected to occur over the lifetime of a business which is discounted at an appropriate discount rate.”</span> <br>- Warren Buffett
            </div>
            <br>By this particular valuation method explained by Warren Buffett, valuing a company can be done using these pieces of information:
            <br><br><ul class="px-5 text-xs list-decimal">
              <li>Owner earnings</li>
              <li>Growth rate</li>
              <li>Discount rate</li>
              <li>Number of years</li>
            </ul>
            <br><span class="text-bright-cyan">Growth rate </span>is the rate at which an investor expects the owner earnings to increase each year over a number of years.
            <br><span class="text-bright-cyan">Discount rate </span>is the rate the earnings are discounted at each year to account for the effect of inflation. Buffett likes to use the long-term U.S. treasury bond rate as the discount rate.
            <br><br><p class="text-gray-400 italic">There will soon be calculator built into the app for this purpose using the 'present value of a growing annuity' method.</p>
            <br>Warren Buffett likes to compare the value he determines with the current market price of the company, and when he invests he does so with a great margin of safety.
            <br><br>The margin of safety is the difference between the value of the business and the current market price. Most investors set their own margin of safety, for example, Warren Buffett generally aims for around a 30% discount as his margin of safety.
          </div>`
        }
      ],
      openModal: false
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
            authorization: this.token
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
            question_nine: this.study.question_nine
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
          authorization: this.token
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
