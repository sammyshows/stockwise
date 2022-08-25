<template>
  <div class="flex flex-col grow overflow-hidden">
    <div class="h-20 flex justify-between px-3">
      <PageTitle :pageDetails="pageDetails" class="truncate mr-3" />
      <img src="/images/logo-cyan.png" class="h-10 -mt-1 mr-1" alt="Stockwise Logo">
    </div>

    <div class="w-full flex flex-col items-center">
      <PhoneIcon class="h-24 mb-6 text-bright-cyan" />
      <p class="mb-10">Email: <span class="text-lg text-bright-cyan">samrmccarthy6@gmail.com</span></p>
      <p class="px-5 text-sm text-center">
        At Stockwise we are continuously working to develop more great tools and ensure we are offering the best possible experience we can.
        <br><br>We encourage you to reach out to us if you have any feedback, feature requests or anything else that you would like to share.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { PhoneIcon } from "@heroicons/vue/outline";

export default defineComponent({
  name: "Contact Us",

  components: {
    PhoneIcon
  },

  data() {
    return {
      pageDetails: {
        title: 'Contact Us',
        returnPath: '/profile'
      }
    }
  }
})
</script>