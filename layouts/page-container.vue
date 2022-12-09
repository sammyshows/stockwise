<template>
  <div class="flex flex-col justify-between h-full" :class="platform === 'ios' ? 'pt-14 pb-6' : 'pt-10 pb-4'">
    <div class="h-full overflow-hidden flex flex-col flex-1">
      <slot></slot>
    </div>
    <NavigationBar :activeButton="activeButton"></NavigationBar>
  </div>
</template>

<script>
import NavigationBar from "../components/NavigationBar"
import { Capacitor } from '@capacitor/core';

export default {
  name: "PageContainer",

  props: ['activeButton'],

  components: {
    NavigationBar
  },

  data() {
    return {
      platform: Capacitor.getPlatform()
    }
  },

  mounted() {
    // Any of this still necessary? There's a meta tag for this in the nuxt.config.ts file
    let viewheight = window.innerHeight;
    let viewwidth = window.innerWidth;
    let viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", "height=" + viewheight + ", width=" + viewwidth + ", initial-scale=1.0");
  }
}
</script>