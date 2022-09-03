<template>
  <div class="flex flex-col grow pt-10 pb-5 overflow-hidden">
    <PageTitle :pageDetails="pageDetails" class="px-3 min-h-min mb-4" />

    <div class="h-full px-3 overflow-scroll">
      <p class="mb-3 text-xs text-center">Please read this Privacy Policy (“Agreement”) carefully before using Stockwise (“App").</p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Conditions of use</h2>
      <p class="mb-3 text-xs">By using this App, you certify and acknowledge that you have read and reviewed this Agreement and that you agree to comply with its terms, and collection and use of information in relation with this policy. We will not use or share your information with anyone except as described in this Privacy Policy. If you do not want to be bound by the terms of this Agreement, you are advised to leave the App accordingly.</p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Information collection and use</h2>
      <p class="mb-3 text-xs">To use the App, we may require you to provide us with certain personally identifiable information, including but not limited to your name, email address and search history. The App only collects the data that is necessary to provide its services. We collect your personal information primarily to provide you with our services and enable your use of our platform. The information that we collect will be used to identify you whilst using the App.
        <br><br>Some ways we may use your information are:
      </p>
      <ul class="ml-3 mb-3 text-xs list-disc">
        <li>to identify and interact with you;</li>
        <li>to allow you to easily access your account on your different devices;</li>
        <li>for any other purpose for which you give your consent.</li>
      </ul>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Security</h2>
      <p class="mb-3 text-xs">We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it.
        <br><br>We take all reasonable steps to protect personal information under our possession from misuse, loss and from unauthorised access, modification or disclosure. We hold your personal information electronically in secure databases operated by our third-party service providers.
        <br><br>While we take all reasonable steps to ensure your personal information is protected from misuse, loss and unauthorised access, modification or disclosure, security measures over the internet can never be guaranteed.
      </p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Cookies</h2>
      <p class="mb-3 text-xs">
        The App uses cookies to enable us to retrieve user details for each visit. Cookies are used in some areas of the App to enable the functionality of this area and ease of use for people using the App. By accessing the App and agreeing to these terms of use, you consent to our use of the required cookies.
        <br><br>We may use cookies to collect, store, and track information for statistical or marketing purposes to operate the App. Please keep in mind that by accepting required Cookies, you also accept third-party Cookies, which might be used via third-party provided services if you use such services on our website.
      </p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Changes to This Privacy Policy</h2>
      <p class="mb-3 text-xs">The App reserves the right to edit, modify, and change this Privacy Policy at any time and as it sees fit. Your continued use of the site following any such variation or amendment will be deemed to have confirmed and accepted the new terms as varied or amended.
      </p>
      <h2 class="mb-3 text-lg font-medium tracking-wider text-bright-cyan">Contact us</h2>
      <p class="mb-3 text-xs">You can contact us about this Privacy Policy using the following details:
        <br><br>Email: samrmccarthy6@gmail.com
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: "Privacy Policy",

  data() {
    return {
      pageDetails: {
        title: "Privacy Policy",
        subtitle: "POLICIES"
      }
    }
  }
})
</script>

<style scoped>

</style>
