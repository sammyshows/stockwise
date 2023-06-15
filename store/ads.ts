import { useUtility } from '@/store/utility'
import { useUser } from '@/store/user'
import { defineStore } from 'pinia'
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, RewardAdPluginEvents, RewardAdOptions } from '@capacitor-community/admob';

export const useAds = defineStore('ads', {
  state: () => {
    return {
      appRoutes: ['notifications', 'search', 'index', 'toolbox', 'profile'], // these routes can show banner ads, routes that can't are /auth, /terms etc.
      showRewardModal: false,
      bannerAdLoaded: false, // indicates whether or not the initial ad has been loaded
      showBannerAd: false,
      rewardAdLoaded: false,
      currentReward: null as ({} | null), // premium tool that user is currently watching an ad to access
      permittedContent: [] as Array<object> // premium tools that have been granted session access
    }
  },

  actions: {
    initialiseBannerAd() {
      const utilityStore = useUtility()

      AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['B480F0393703070BEEF8D0B02FF711F5'], // If interested add test ids here such as laptop, my phone, Celine's phone: https://developers.google.com/admob/android/test-ads#add_your_test_device_in_the_admob_ui
        initializeForTesting: false,
      });

      AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        if (this.appRoutes.includes(this.$router.currentRoute.value.name.split('-')[0])) {
          AdMob.resumeBanner()
          this.bannerAdLoaded = true
          this.showBannerAd = true
        }

        utilityStore.logUserActivity(600, this.$router.currentRoute.value.name, "INFO", "A BANNER ad loaded.")
      });

      AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => {
        utilityStore.logUserActivity(601, this.$router.currentRoute.value.name, "WARN", "A BANNER ad failed to load.")
      });

      AdMob.addListener(BannerAdPluginEvents.Opened, () => {
        utilityStore.logUserActivity(602, this.$router.currentRoute.value.name, "INFO", "User clicked on a BANNER ad.")
      });

      AdMob.addListener(BannerAdPluginEvents.Closed, () => {
        utilityStore.logUserActivity(603, this.$router.currentRoute.value.name, "INFO", "User closed a full page BANNER ad.")
      });
    },

    async initialiseRewardAd() {
      const utilityStore = useUtility()

      AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['B480F0393703070BEEF8D0B02FF711F5'], // If interested add test ids here such as laptop, my phone, Celine's phone: https://developers.google.com/admob/android/test-ads#add_your_test_device_in_the_admob_ui
        initializeForTesting: false,
      });

      AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        console.log('LOADED')
        utilityStore.logUserActivity(606, this.$router.currentRoute.value.name, "INFO", "A REWARD ad loaded.")
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
        console.log('FAILED TO LOAD')
        utilityStore.logUserActivity(607, this.$router.currentRoute.value.name, "INFO", "A REWARD ad failed to load.")
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('DISMISSED')
        this.currentReward = null
        this.showRewardModal = false
        this.prepareRewardAd()

        utilityStore.logUserActivity(608, this.$router.currentRoute.value.name, "INFO", "User dismissed a REWARD ad.")
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
        console.log('FAILED TO SHOW')
        if (this.currentReward) {
          this.permittedContent.push(this.currentReward)
          this.currentReward = null
        }

        this.prepareRewardAd()
        utilityStore.logUserActivity(609, this.$router.currentRoute.value.name, "INFO", "A REWARD ad failed to show - giving content access to user.")
      });

      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        console.log('REWARDED')
        if (this.currentReward) {
          this.permittedContent.push(this.currentReward)
          this.$router.push({
            path: this.currentReward.path,
            query: {
              accessGranted: true
            }
          })
          this.currentReward = null
        }

        this.showRewardModal = false
        this.prepareRewardAd()
        utilityStore.logUserActivity(610, this.$router.currentRoute.value.name, "INFO", "User finished watching a REWARD ad.")
      });

      AdMob.addListener(RewardAdPluginEvents.Showed, () => {
        console.log('SHOWED')
      });
    },

    async prepareRewardAd(): Promise<void> {
      const userStore = useUser()
      // this.rewardAdLoaded = false
      const getRewardAdId = (): string => {
        if (userStore.platform === 'android')
          if (userStore.userId === '987336b9-2cce-454a-a711-230b74bd1140')
            return 'ca-app-pub-3940256099942544/5224354917' // testing
          else
            return 'ca-app-pub-7719091147897476/7336552975' // production
        else // if (userStore.platform === 'ios')
          if (userStore.userId === '987336b9-2cce-454a-a711-230b74bd1140')
            return 'ca-app-pub-3940256099942544/5224354917' // testing
          else
            return 'ca-app-pub-7719091147897476/5099565587' // production
      }

      const options: RewardAdOptions = {
        adId: getRewardAdId()
      }

      await AdMob.prepareRewardVideoAd(options)
      this.rewardAdLoaded = true
    },

    async showRewardAd(reward: object) {
      this.currentReward = reward
      // testing
      // this.permittedContent.push(reward)
      // this.$router.push({
      //   path: this.currentReward.path,
      //   query: {
      //     accessGranted: true
      //   }
      // })
      // this.showRewardModal = false
      // end
      await AdMob.showRewardVideoAd()
    }
  }
})