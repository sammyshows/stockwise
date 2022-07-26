<template>
  <div class="flex flex-col justify-between h-full pt-10 pb-4">
    <div class="h-full overflow-hidden flex flex-col flex-1">
      <slot></slot>
    </div>
    <NavigationBar :activeButton="activeButton"></NavigationBar>
  </div>
</template>

<script>
import NavigationBar from "../components/NavigationBar"

export default {
  name: "PageContainer",

  props: ['activeButton'],

  components: {
    NavigationBar
  },

  mounted() {
    let viewheight = window.innerHeight;
    let viewwidth = window.innerWidth;
    let viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", "height=" + viewheight + ", width=" + viewwidth + ", initial-scale=1.0");
  }
}
</script>
