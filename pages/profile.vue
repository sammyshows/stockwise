<template>
  <NuxtLayout name="page-container" activeButton="profile">
    <div class="flex items-center justify-center grow">
      <ButtonsCyan text="Logout" @clicked="$logout()" />
    </div>
  </NuxtLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Profile",

  async setup() {
    const token = await useState('authToken').value;
    return { token }
  }
})
</script>