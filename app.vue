<template>
  <div class="max-h-full flex flex-col h-full w-full">
    <div :style="[ showBannerAd ? 'max-height: calc(100% - 25px)' : 'max-height: 100%' ]" class="flex flex-col justify-between page overflow-hidden">
      <NuxtLayout v-if="navRoutes.includes(routeBranch)" name="page-container">
        <NuxtPage />
      </NuxtLayout>

      <NuxtPage v-else />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents } from '@capacitor-community/admob';
import { useUser } from '@/store/user'
import { useUtility } from '@/store/utility'
import { useAds } from '@/store/ads'

export default defineComponent({
  name: "App",

  setup() {
    const userStore = useUser()
    const utilityStore = useUtility()
    const adStore = useAds()
    const { showBannerAd } = storeToRefs(adStore)

    return { userStore, utilityStore, adStore, showBannerAd }
  },

  data() {
    return {
      navRoutes: ['notifications', 'search', 'index', 'toolbox', 'profile'],
      adLoaded: false, // indicates whether or not the initial ad has been loaded
      bannerOptions: {
        // adId: this.userStore.platform === 'android' ? 'ca-app-pub-7719091147897476/6009621957' : 'ca-app-pub-7719091147897476/9567664951', // testing
        adId: this.getBannerId(),
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.TOP_CENTER,
        margin: 0,
        isTesting: false,
        npa: false // Non Personalised Ads
      }
    }
  },

  computed: {
    // ['notifications', 'search', 'index', 'studies', 'profile']
    routeBranch() { return this.$route.name.split('-')[0] }
  },

  watch: {
    async $route(to, from) {
      if (this.userStore.platform === 'android') {
        // Check if we're navigating from a page where an ad was hidden (or not loaded at all), to a page where there should be an ad.
        const mustLoadAd = !this.navRoutes.includes(from.name.split('-')[0]) && this.navRoutes.includes(to.name.split('-')[0])

        if (mustLoadAd) {
          if (this.adLoaded)
            AdMob.resumeBanner()
          else
            this.showBanner()
        } else if (!this.navRoutes.includes(to.name.split('-')[0])) {
          this.adStore.patch({ showBannerAd: false })
          AdMob.hideBanner()
        } else if (this.adLoaded) { // this else case is essentially saying 'we navigated from an ad page to another ad page' - nothing should need to change. Calling resumeBanner() just to be safe...
          AdMob.resumeBanner();
          this.adStore.patch({ showBannerAd: true })
        }
      }
    }
  },

  async mounted() {
    this.adStore.initialiseBannerAd() // REMOVE, just here for web testing
    // Temporary until ads are actually enabled. I updated privacy info so now Apple wants to see the request be made
    if (this.userStore.platform === 'ios') {
      this.adStore.initialiseRewardAd()
      this.adStore.prepareRewardAd()
      // const { status } = await AdMob.trackingAuthorizationStatus(); // gets the tracking authorization status

      AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['B480F0393703070BEEF8D0B02FF711F5'], // If interested add test ids here such as laptop, my phone, Celine's phone: https://developers.google.com/admob/android/test-ads#add_your_test_device_in_the_admob_ui
        initializeForTesting: false,
      });
    }

    if (this.userStore.platform === 'android') {
      this.adStore.initialiseRewardAd()
      this.adStore.prepareRewardAd()
      this.adStore.initialiseBannerAd()
      if (this.navRoutes.includes(this.routeBranch))
        this.showBanner()
      else {
        this.adStore.$patch({ bannerAdShow: true })
        AdMob.hideBanner()
      }
    }
  },

  methods: {
    getBannerId() {
      if (this.userStore.platform === 'android')
        if (this.userStore.userId === '987336b9-2cce-454a-a711-230b74bd1140')
          return 'ca-app-pub-7719091147897476/6009621957' // testing
        else
          return 'ca-app-pub-7719091147897476/8002483602' // production
      else if (this.userStore.platform === 'ios') // ios
        if (this.userStore.userId === '987336b9-2cce-454a-a711-230b74bd1140')
          return 'ca-app-pub-7719091147897476/9567664951' // testing
        else
          return 'ca-app-pub-7719091147897476/2112788715' // production
    },

    showBanner() {
      AdMob.showBanner(this.bannerOptions)
    }
  }
})
</script>

<style scoped>
/* This ensures that this App.vue is inside a flexbox i.e. so we can position the page at the bottom when we have a top banner */
#__nuxt {
  display: flex;
}

.page {
  height: 100%;
  margin: auto 0 0 0;
  transition: max-height 0.7s ease-in-out;
}

</style>