<template>
  <div class="page-background flex flex-col justify-between h-full pt-10 pb-4">
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

<style>
.page-background {
  background: linear-gradient(195deg, rgba(25,25,25,1) 0%, rgba(33,33,33,1) 41%, rgba(65,70,70,1) 74%, rgba(107,118,120,1) 100%) no-repeat center top fixed;
}
</style>
