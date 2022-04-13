<template>
  <div v-bind:style="{ height: '740px' }" class="flex flex-col justify-between pt-10 pb-4">
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

  data() {
    return {
      pageStyle: {
        height: window.innerHeight
      }
    }
  }
}
</script>
