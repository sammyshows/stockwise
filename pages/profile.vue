<template>
  <NuxtLayout name="page-container" activeButton="profile">
    <button @click="$logout()">logout</button>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Profile",

  async setup() {
    const token = await useState('authToken').value;
    console.log(token)
    return { token }
  }
})
</script>