import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { Capacitor } from '@capacitor/core';
const platform = Capacitor.getPlatform()

export default defineNuxtRouteMiddleware(async (to, from) => {
  // check for the code in the query params since IDP logins (Google, Apple etc.) won't have an access token saved until after the code has been consumed
  if (['ios', 'android'].includes(platform) && to.path === '/' && !from.query.code) {
    const keyNames = await SecureStoragePlugin.keys()
      .then(result => result.value)

    // key has to be defined for this particular capacitor plugin to work.
    const key = 'accessToken'
    if (!keyNames.includes(key))
      return navigateTo('/auth/login')
  }
})