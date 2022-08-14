<template>
  <div class="relative w-full h-full flex flex-col pt-10 pb-5 overflow-scroll">
    <div>
      <img src="/images/logo-cyan.png" alt="Stockwise Logo" class="h-24 mx-auto">
      <h1 class="pt-3 text-3xl font-medium text-bright-cyan text-center">Stockwise</h1>
    </div>

    <div v-if="!resetComplete" class="relative">
      <Transition name="send-email">
        <div v-if="!showResetForm" class="absolute mt-10 pb-20 px-10">
          <p class="mt-4 text-xs text-center text-gray-300">To reset your password, please enter your email so we can send you a password reset code:</p>
          <div class="mt-2.5">
            <p class="text-tiny leading-normal" :class="[ invalid.email ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please add your email</p>
            <input @keyup="invalid.email = false" v-model="email" autocomplete="off" placeholder="Email" type="text" class="placeholder:text-gray-500 w-full h-12 mt-1.5 text-sm rounded-xl bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
          </div>
          <button @click="sendResetEmail" class="w-full h-12 mt-5 border border-bright-cyan rounded-xl font-medium text-lg text-bright-cyan">Send reset email</button>
          <p class="mt-10 text-center text-gray-300 text-sm">Or go back to <a href="/auth/signup" class="underline underline-offset-4 text-bright-cyan">Log in</a> or <a href="/auth/signup" class="underline underline-offset-4 text-bright-cyan">Sign up</a></p>
        </div>
      </Transition>

      <Transition name="reset">
        <div v-if="showResetForm" class="absolute mt-10 pb-20 px-10">
          <p class="mt-4 text-xs text-center text-gray-300">An email has been sent to <span class="text-bright-cyan">{{ email }}</span>.</p>
          <p class="mt-2.5 text-xs text-center text-gray-300">Enter the secret code below and enter your new password:</p>
          <p v-if="resetError" class="mt-2.5 text-xs text-center text-red-600">&#10033;&nbsp;&nbsp;An error has occurred. Please verify that the secret code and password are valid.</p>
          <div class="mt-2.5">
            <p class="text-tiny leading-normal" :class="[ invalid.secretCode ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please enter your secret code</p>
            <input @keyup="invalid.secretCode = false" v-model="secretCode" autocomplete="off" placeholder="Secret code" type="text" class="placeholder:text-gray-500 w-full h-12 mt-1.5 text-sm rounded-xl bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
          </div>
          <div class="mt-2.5">
            <p class="text-tiny leading-normal" :class="[ invalid.password ? 'text-red-600': 'hidden' ]">&#10033;&nbsp;&nbsp;Please enter a valid password</p>
            <input @keyup="invalid.password = false; validatePassword()" v-model="password" autocomplete="off" placeholder="Password" type="text" class="placeholder:text-gray-500 w-full h-12 mt-1.5 text-sm rounded-xl bg-gray-900/20 border border-gray-400/40 focus:ring-0 focus:border-white">
          </div>
          <div class="pt-2.5 px-2.5 rounded-xl text-xs text-gray-300">
            <p :class="{ 'text-bright-green': validPassword.minLength }">&#8226; At least 8 characters</p>
            <p :class="{ 'text-bright-green': validPassword.lowercase }">&#8226; Has lowercase letters</p>
            <p :class="{ 'text-bright-green': validPassword.uppercase }">&#8226; Has uppercase letters</p>
            <p :class="{ 'text-bright-green': validPassword.numbers }">&#8226; At least one number</p>
          </div>
          <button @click="resetPassword" class="w-full h-12 mt-5 border border-bright-cyan rounded-xl font-medium text-lg text-bright-cyan">Reset password</button>
          <div @click="toggleReset" class="flex w-max mt-5 text-gray-300">
            <ArrowNarrowRightIcon class="h-4 w-4 mr-2 rotate-180" />
            <p class="text-xs underline underline-offset-4">Return to previous page</p>
          </div>
        </div>
      </Transition>
    </div>

    <div v-if="resetComplete" class="mt-10 pb-20 px-10">
      <p class="mt-4 text-xs text-center text-gray-300">Your password has successfully been updated. Return to the login page to continue.</p>
      <button @click="redirectToLogin" class="w-full h-12 mt-5 border border-bright-cyan rounded-xl font-medium text-lg text-bright-cyan">Return to log in</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ArrowNarrowRightIcon } from '@heroicons/vue/outline';


export default defineComponent({
  name: "Signup",

  components: {
    ArrowNarrowRightIcon
  },

  data() {
    return {
      config: useRuntimeConfig(),
      invalid: {
        email: false,
        password: false,
        secretCode: false
      },
      validPassword: {
        minLength: false,
        lowercase: false,
        uppercase: false,
        numbers: false
      },
      email: '',
      password: '',
      secretCode: '',
      resetComplete: false,
      showResetForm: false,
      resetError: false
    }
  },

  methods: {
    validResetForm(): Boolean {
      this.invalid.secretCode = this.secretCode === ''
      this.invalid.password = !this.validatePassword()

      return this.invalid.secretCode === false && this.invalid.password === false
    },

    toggleReset() {
      this.showResetForm = !this.showResetForm
    },

    validatePassword(): Boolean {
      this.validPassword.minLength = this.password.length >= 8
      this.validPassword.lowercase = this.password !== this.password.toUpperCase()
      this.validPassword.uppercase = this.password !== this.password.toLowerCase()
      this.validPassword.numbers = /\d/.test(this.password)

      return this.validPassword.minLength === true && this.validPassword.lowercase === true && this.validPassword.uppercase === true && this.validPassword.numbers === true
    },

    async sendResetEmail() {
      if (this.email.includes('@')) {
        await this.$forgotPassword(this.email)
        this.toggleReset()
      } else {
        this.invalid.email = true
      }
    },

    async resetPassword() {
      if (this.validResetForm()) {
        const responseStatus = await this.$confirmPassword(this.secretCode, this.email, this.password)
        console.log(responseStatus)
        if (responseStatus === 200)
          this.resetComplete = true
        else
          this.resetError = true
      }
    },

    redirectToLogin() {
      window.location.href = `${this.config.DOMAIN}/auth/login`
    }
  }
})
</script>

<style scoped>
.send-email-enter-active, .send-email-leave-active {
  transition: 400ms ease-in-out;
}

.send-email-leave-to, .send-email-enter-from {
  transform: translateX(-360px);
}

.reset-enter-active, .reset-leave-active {
  transition: 400ms ease-in-out;
}

.reset-enter-from, .reset-leave-to {
  transform: translateX(360px);
}
</style>