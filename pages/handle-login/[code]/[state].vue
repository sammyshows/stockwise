<template>
  <div>
    <h1>Yoooooo!</h1>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  async mounted() {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("code", this.$route.params.code)
    searchParams.set("state", this.$route.params.state)
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
    const newParams = new URLSearchParams(window.location.search)

    await this.$handleRedirectLogin()
    this.$router.push({ name: 'portfolios' })
  }
})
</script>