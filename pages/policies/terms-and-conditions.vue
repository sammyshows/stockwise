<template>
  <div class="flex flex-col grow pt-10 pb-5 overflow-hidden">
    <PageTitle :pageDetails="pageDetails" class="px-3 min-h-min mb-4" />

    <div class="h-full px-3 overflow-scroll">
      <p class="mb-3 text-xs text-center">Please read these terms and conditions (“Agreement”) carefully before using Stockwise (“App").</p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Conditions of use</h2>
      <p class="mb-3 text-xs">By using this App, you certify and acknowledge that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to leave the App accordingly.</p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">User accounts</h2>
      <p class="mb-3 text-xs">As a user of this App, you may be asked to register with us and provide private information. You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information. You are also responsible for all activities that occur under your account or password.
        <br><br>If you think there are any possible issues regarding the security of your account on the App, inform us immediately so we may address them accordingly.
        <br><br>The App reserve all rights to terminate accounts, edit or remove content at our sole discretion.
      </p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Cookies</h2>
      <p class="mb-3 text-xs">The App uses cookies to enable us to retrieve user details for each visit. Cookies are used in some areas of the App to enable the functionality of this area and ease of use for people using the App. By accessing the App and agreeing to these terms of use, you consent to our use of the required cookies.
        <br><br>We may use cookies to collect, store, and track information for statistical or marketing purposes to operate the App. Please keep in mind that by accepting required Cookies, you also accept third-party Cookies, which might be used via third-party provided services if you use such services on our website.
      </p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Intellectual property</h2>
      <p class="mb-3 text-xs">You agree that all materials and services provided on this website are the property of the App and its affiliates, including but not limited to, the contents, layout, colours, appearance, graphics and imagery of the App as well as all copyrights, trade secrets, trademarks, patents, and other intellectual property. You also agree that you will not reproduce or redistribute the the App’s intellectual property in any way.</p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Disclaimer</h2>
      <p class="mb-3 text-xs">The information contained in or provided by the App is not intended to be and does not constitute financial advice, investment advice, trading advice, or any other advice.
        The information within a study, from or through a study is general in nature and is not specific to you the User or anyone else.
        You should not make any decision, financial, investment, trading, or otherwise, based on any information presented in this app without undertaking independent due diligence and consultation with a professional broker or financial advisor.
        <br><br>The financial information provided in the App is sourced from IEX Cloud. Market information may or may not be delayed by up to or more than 15 minutes. The App may at times use financial data based only on trades made with IEX.
      </p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Indemnification</h2>
      <p class="mb-3 text-xs">You agree to indemnify the App and its affiliates and hold the App harmless in relation to any and all claims, suits, demands, actions, liabilities, costs and expenses may arise from or relate your use or misuse of our services.</p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Exclusion of liability</h2>
      <p class="mb-3 text-xs">The App is not liable for any damages that may occur to you as a result of your misuse of the App. To the maximum extent permitted by applicable law, this App:
        <br><br>excludes all representations warranties and conditions relating to the App, the use of the App and its contents or which is or may be provided by any affiliates or any other third party, including, without limitation, in relation to any mistakes, errors, inaccuracies or omissions in App’s literature, and any warranties implied by law in respect of satisfactory quality, fitness for purpose and/or the use of reasonable care and skill;
        <br><br>excludes all liability for damages arising out of or in connection with your use of this website. This includes, without limitation, direct loss, loss of business or profits, damage caused to your computer, computer software, systems and programs and the data thereon or any other direct or indirect, consequential and incidental damages;
        <br><br>excludes any liability in relation to accuracy, completeness, performance, reliability, timelessness, quality, safety, legality or suitability for a particular purpose;
        <br><br>exclude any liability for any damages, loss, costs or expenses including legal costs and expenses, whether direct or indirect, incurred by you in connection with your use of the app excludes all liability for fraud or fraudulent misrepresentation;
        <br><br>excludes all liability for death or personal injury;
        <br><br>Your use of the App is entirely at your own risk. It is your responsibility to make sure that any content or other information available through the App suits your particular purpose.
      </p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Variation</h2>
      <p class="mb-3 text-xs">The App reserves the right to edit, modify, and change this Agreement at any time and as it sees fit. Your continued use of the site following any such variation or amendment will be deemed to have confirmed and accepted the new terms as varied or amended.</p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Contact us</h2>
      <p class="mb-3 text-xs">You can contact us about these Terms and Conditions using the following details:
        <br><br>Email: samrmccarthy6@gmail.com
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "Terms and Conditions",

  data() {
    return {
      pageDetails: {
        title: "Terms and Conditions",
        subtitle: "POLICIES"
      }
    }
  }
})
</script>

<style scoped>

</style>
