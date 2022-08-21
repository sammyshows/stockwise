<template>
  <div class="w-full h-full flex flex-col justify-between pt-10 pb-5 px-10 overflow-scroll">
    <div>
      <img src="/images/logo-cyan.png" alt="Stockwise Logo" class="h-24 mx-auto">
      <h1 class="pt-3 text-3xl font-medium text-bright-cyan text-center">Stockwise</h1>
      <h2 class="pt-1 px-3 text-xs text-gray-300 text-center">Study companies and track your investments</h2>
    </div>
    <div>
      <p v-if="authMessage === 'notAuthorized'" class="mt-2.5 text-xs text-center text-red-600">&#10033;&nbsp;&nbsp;The email or password is incorrect. Please verify your credentials and try again.</p>
      <p v-else-if="authMessage === 'error'" class="mt-2.5 text-xs text-center text-red-600">&#10033;&nbsp;&nbsp;An error has occurred. Please verify your credentials and try again.</p>
      <div class="mt-2.5">
        <p class="text-tiny leading-normal" :class="[ invalid.email ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add your email</p>
        <input @keyup="invalid.email = false" v-model="email" autocomplete="off" placeholder="Email" type="text" class="placeholder:text-gray-500 w-full h-12 mt-1.5 text-sm rounded-xl bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
      </div>
      <div class="mt-2.5">
        <p class="text-tiny leading-normal" :class="[ invalid.password ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a valid password</p>
        <input @keyup="invalid.password = false" v-model="password" autocomplete="off" placeholder="Password" type="text" class="placeholder:text-gray-500 w-full h-12 mt-1.5 text-sm rounded-xl bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
      </div>
      <a href="/auth/password-reset" class="mt-2 float-right text-gray-400 text-xs underline underline-offset-4">Forgot password?</a>
      <button @click="login" class="w-full h-12 mt-5 border border-bright-cyan rounded-xl font-medium text-lg text-bright-cyan">Sign in</button>
      <p class="line w-5/6 mx-auto text-center overflow-hidden">or</p>
      <div @click="googleLogin" class="flex items-center bg-white rounded-full">
        <img src="/images/google-icon.svg" alt="" class="rounded-xl h-9 pl-2">
        <h2 class="flex items-center justify-center grow h-12 text-center text-gray-600 text-lg" style="font-family: Roboto, Poppins; font-weight: 500;">Sign in with Google</h2>
      </div>
      <p class="mt-5 text-center text-gray-300 text-sm">Don't have an account? <a href="/auth/signup" class="underline underline-offset-4 text-bright-cyan">Sign up</a></p>
    </div>
    <p class="mt-3 text-xs text-center text-gray-200">By continuing, you agree to Stockwise's <a href="/policies/terms-and-conditions" class="underline">Terms of Use</a> and <a href="/policies/privacy-policy" class="underline">Privacy Policy</a></p>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: "Signup",

  data() {
    return {
      config: useRuntimeConfig(),
      invalid: {
        email: false,
        password: false
      },
      email: '',
      password: '',
      authMessage: ''
    }
  },

  methods: {
    validateForm() {
      this.invalid.email = !this.email.includes('@')
      this.invalid.password = this.password === ''

      return this.invalid.email === false && this.invalid.password === false
    },

    googleLogin() {
      window.location.href = `${this.config.AWS_AUTH_URL}/oauth2/authorize?redirect_uri=${this.config.DOMAIN}/portfolios&response_type=code&client_id=${this.config.AWS_CLIENT_ID}&identity_provider=Google&nonce=42466df4-5557-45d0-b4d4-a474dd0a7b6c`
    },

    async login() {
      this.authMessage = ''
      if (this.validateForm()) {
        this.authMessage = await this.$login(this.email, this.password)
        if (this.authMessage === 'authorized')
          window.location.href = `${this.config.DOMAIN}/portfolios`
      }
    }
  }
})
</script>

<style scoped>
.line {
  width: 70%;
  margin: 20px auto;
  overflow: hidden;
  text-align: center;
  font-weight:300;
  color: rgb(156 163 175 / 0.6);
}

.line:before, .line:after {
  content: "";
  display: inline-block;
  width: 50%;
  margin: 0 .5em 0 -55%;
  vertical-align: middle;
  border-bottom: 1px solid;
}

.line:after {
  margin: 0 -55% 0 .5em;
}
</style>