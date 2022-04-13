<template>
  <div v-bind:style="pageStyle" class="flex flex-col justify-between pt-10 pb-4">
    <div class="h-full px-3 mb-4 overflow-scroll">
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
  },

  data() {
    return {
      pageStyle: {
        height: '100vh'
      }
    }
  }
}
</script>
