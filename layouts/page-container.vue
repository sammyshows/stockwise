<template>
  <div class="flex flex-col justify-between h-full w-full overflow-hidden" :class="[ platform === 'ios' ? 'pt-14' : 'pt-10' ]">
    <div class="h-full w-full overflow-hidden flex flex-col flex-1">
      <slot />
    </div>
    <NavigationBar v-show="showNavbar" />
  </div>
</template>

<script lang="ts">
import NavigationBar from "../components/NavigationBar"
import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'

export default {
  name: "PageContainer",

  components: {
    NavigationBar
  },

  data() {
    return {
      platform: Capacitor.getPlatform(),
      showNavbar: true
    }
  },

  mounted() {
    if (['ios', 'android'].includes(this.platform)) {
      Keyboard.addListener('keyboardWillShow', info => {
        this.showNavbar = false
      });

      Keyboard.addListener('keyboardDidShow', info => {
        this.showNavbar = false
      });

      Keyboard.addListener('keyboardWillHide', () => {
        this.showNavbar = true
      });

      Keyboard.addListener('keyboardDidHide', () => {
        this.showNavbar = true
      });
    }
  }
}
</script>