<template>
  <div class="h-screen flex flex-col justify-between pt-10 pb-4">
    <div class="h-full px-8 mb-4 overflow-scroll">
      <slot></slot>
    </div>
    <NavigationBar></NavigationBar>
  </div>
</template>

<script>
import NavigationBar from "../components/NavigationBar"

export default {
  name: "PageContainer",

  components: {
    NavigationBar
  }
}
</script>