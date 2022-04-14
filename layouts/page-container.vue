<template>
  <div v-bind:style="pageStyle" class="flex flex-col justify-between pt-10 pb-4">
    <div class="h-full px-3 mb-4 overflow-hidden flex flex-col flex-1">
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
    this.pageStyle = {
      height: `${window.innerHeight}px`
    }
    window.addEventListener("resize", this.setHeight);
  },

  destroyed() {
    window.removeEventListener("resize", this.setHeight);
  },

  data() {
    return {
      pageStyle: {
        height: '100%'
      }
    }
  },

  methods: {
    setHeight() {
      this.height = `${window.innerHeight}px`
    }
  }
}
</script>
