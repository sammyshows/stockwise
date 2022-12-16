<template>
  <div class="flex flex-col justify-between h-full" :class="platform === 'ios' ? 'pt-14 pb-6' : 'pt-10 pb-4'">
    <div class="h-full overflow-hidden flex flex-col flex-1">
      <slot></slot>
    </div>
    <NavigationBar />
  </div>
</template>

<script>
import NavigationBar from "../components/NavigationBar"
import { Capacitor } from '@capacitor/core';

export default {
  name: "PageContainer",

  components: {
    NavigationBar
  },

  data() {
    return {
      platform: Capacitor.getPlatform()
    }
  }
}
</script>