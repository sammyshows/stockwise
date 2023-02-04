<template>
  <div class="w-full h-full flex flex-col justify-between px-10 overflow-scroll" :class="platform === 'ios' ? 'pt-14 pb-6' : 'pt-10 pb-5'">
    <div>
      <img src="/images/logo-cyan.png" alt="Stockwise Logo" class="h-24 mx-auto">
      <h1 class="pt-3 text-3xl font-medium text-bright-cyan text-center">Stockwise</h1>
      <h2 class="pt-1 px-3 text-xs text-gray-200 text-center">Study companies and track your investments</h2>
    </div>
    <div>
      <p v-if="authMessage === 'error'" class="mt-2.5 text-xs text-center text-red-600">&#10033;&nbsp;&nbsp;An error has occurred. Please verify that the details you entered are correct.</p>
      <p v-if="authMessage === 'userExists'" class="mt-2.5 text-xs text-center text-red-600">&#10033;&nbsp;&nbsp;An account with that email already exists.</p>
      <div class="mt-2.5">
        <p class="text-tiny leading-normal" :class="[ invalid.email ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add your email</p>
        <input @keyup="invalid.email = false" v-model="email" autocomplete="on" placeholder="Email" type="text" class="placeholder:text-gray-500 w-full h-12 mt-1.5 text-sm rounded-xl bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
      </div>
      <div class="mt-2.5">
        <p class="text-tiny leading-normal" :class="[ invalid.password ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add a valid password</p>
        <input @keyup="validatePassword(); invalid.password = false;" v-model="password" autocomplete="on" placeholder="Password" type="password" class="placeholder:text-gray-500 w-full h-12 mt-1.5 text-sm rounded-xl bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
      </div>
      <div v-if="password.length > 0" class="pt-2.5 px-2.5 rounded-xl text-xs text-gray-200">
        <p :class="{ 'text-bright-green': validPassword.minLength }">&#8226; At least 8 characters</p>
        <p :class="{ 'text-bright-green': validPassword.lowercase }">&#8226; Has lowercase letters</p>
        <p :class="{ 'text-bright-green': validPassword.uppercase }">&#8226; Has uppercase letters</p>
        <p :class="{ 'text-bright-green': validPassword.numbers }">&#8226; At least one number</p>
      </div>
      <button :disabled="disabledSignUp" @click="signUp" style="touch-action: manipulation" class="flex justify-center items-center w-full h-12 mt-5 border border-bright-cyan rounded-xl font-medium text-lg text-bright-cyan">
        <p>{{ disabledSignUp ? 'Creating account' : 'Create account' }}</p>
        <Spinner v-if="disabledSignUp" class="h-5 w-5 my-auto ml-2"></Spinner>
      </button>
      <p class="mt-5 text-center text-gray-200 text-sm">Already have an account? <a @click="redirectToLogin()" class="underline underline-offset-4 text-bright-cyan">Log in</a></p>
      <p class="line w-5/6 mx-auto text-center overflow-hidden">or</p>
      <div @click="idpLogin('Google')" class="flex items-center bg-white rounded-full">
        <div class="w-20">
          <img src="/images/google-icon.svg" alt="" class="rounded-xl h-9 pl-2">
        </div>
        <h2 class="flex items-center h-12 text-gray-600 text-lg" style="font-family: Roboto, Poppins; font-weight: 500;">Sign in with Google</h2>
      </div>

      <div @click="idpLogin('SignInWithApple')" class="flex items-center bg-white rounded-full mt-2.5">
        <div class="w-20">
          <img src="/images/apple-icon.svg" alt="" class="rounded-xl h-12 pl-0.5">
        </div>
        <h2 class="flex items-center h-12 text-gray-600 text-lg" style="font-family: Roboto, Poppins; font-weight: 500;">Sign in with Apple</h2>
      </div>
    </div>
    <p class="mt-3 text-xs text-center text-gray-200">By continuing, you agree to Stockwise's <span @click="redirectToPolicies('/policies/terms-and-conditions')" class="underline">Terms of Use</span> and <span @click="redirectToPolicies('/policies/privacy-policy')" class="underline">Privacy Policy</span></p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Capacitor } from '@capacitor/core';
import { Browser } from "@capacitor/browser";
import { useUtility } from "@/store/utility";

export default defineComponent({
  name: "Signup",

  setup() {
    const utilityStore = useUtility()

    return { utilityStore }
  },

  data() {
    return {
      config: useRuntimeConfig(),
      platform: Capacitor.getPlatform(),
      disabledSignUp: false,
      invalid: {
        email: false,
        password: false
      },
      validPassword: {
        minLength: false,
        lowercase: false,
        uppercase: false,
        numbers: false
      },
      email: '',
      password: '',
      authMessage: ''
    }
  },

  methods: {
    validateForm(): Boolean {
      this.invalid.email = !this.email.includes('@')
      this.invalid.password = !this.validatePassword()

      return this.invalid.email === false && this.invalid.password === false
    },

    async idpLogin(identityProvider) {
      this.utilityStore.logUserActivity(11, "Signup Page", "INFO", "User clicked on an IDP sign in option.")

      // If the user is on the web or iOS, go directly to the sign in url. On iOS the user is returned to the app after login via deep links / universal links
      if (this.platform === 'web' || this.platform === 'ios')
        window.location.href = `${this.config.AWS_AUTH_URL}/oauth2/authorize?redirect_uri=${this.config.DOMAIN}&response_type=code&client_id=${this.config.AWS_CLIENT_ID}&identity_provider=${identityProvider}&nonce=42466df4-5557-45d0-b4d4-a474dd0a7b6c`
      // If the user is using the Android App, open a Browser within the app so the user is returned to the app using deep links after signing in.
      else
        await Browser.open({ url: `${this.config.AWS_AUTH_URL}/oauth2/authorize?redirect_uri=${this.config.DOMAIN}&response_type=code&client_id=${this.config.AWS_CLIENT_ID}&identity_provider=${identityProvider}&nonce=42466df4-5557-45d0-b4d4-a474dd0a7b6c` })
    },

    validatePassword(): Boolean {
      this.validPassword.minLength = this.password.length >= 8
      this.validPassword.lowercase = this.password !== this.password.toUpperCase()
      this.validPassword.uppercase = this.password !== this.password.toLowerCase()
      this.validPassword.numbers = /\d/.test(this.password)

      return this.validPassword.minLength === true && this.validPassword.lowercase === true && this.validPassword.uppercase === true && this.validPassword.numbers === true
    },

    async signUp() {
      this.disabledSignUp = true
      this.authMessage = ''
      if (this.validateForm()) {
        this.utilityStore.logUserActivity(12, "Signup Page", "INFO", "User clicked on the 'Create account' button (email / password).")

        const response = await this.$signUp(this.email.trim().toLowerCase(), this.password)
        this.authMessage = response
        if (response === 'success') {
          this.$router.push('/')
        } else {
          this.disabledSignUp = false
        }
      } else {
        this.disabledSignUp = false
        this.utilityStore.logUserActivity(13, "Signup Page", "INFO", "User clicked on the 'Create account' button (email / password) but the form was invalid.")
      }
    },

    redirectToLogin() {
      this.utilityStore.logUserActivity(14, "Signup Page", "INFO", "User clicked on a link to the login page.")
      window.location.href = '/auth/login'
    },

    redirectToPolicies(href: string) {
      this.utilityStore.logUserActivity(15, "Signup Page", "INFO", "User clicked on a link to Terms and Conditions or Privacy Policy.")
      window.location.href = href
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