<template>
  <div class="page flex flex-col justify-between h-full w-full overflow-hidden" :class="[{ 'ad-spacing': showAd }, platform === 'ios' ? 'pt-14 pb-6' : 'pt-10 pb-4']">
    <div class="h-full w-full overflow-hidden flex flex-col flex-1">
      <slot />
    </div>
    <NavigationBar />
  </div>
</template>

<script lang="ts">
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import NavigationBar from "../components/NavigationBar"
import { Capacitor } from '@capacitor/core';

export default {
  name: "PageContainer",

  components: {
    NavigationBar
  },

  data() {
    return {
      platform: Capacitor.getPlatform(),
      showAd: false
    }
  },

  async mounted() {
    if (this.platform !== 'web') {
      const {status} = await AdMob.trackingAuthorizationStatus();

      if (status === 'notDetermined') {
        /**
         * If you want to explain TrackingAuthorization before showing the iOS dialog,
         * you can show the modal here.
         * ex)
         * const modal = await this.modalCtrl.create({
         *   component: RequestTrackingPage,
         * });
         * await modal.present();
         * await modal.onDidDismiss();  // Wait for close modal
         **/
      }

      AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['B480F0393703070BEEF8D0B02FF711F5'], // If interested add test ids here such as laptop, my phone, Celine's phone: https://developers.google.com/admob/android/test-ads#add_your_test_device_in_the_admob_ui
        initializeForTesting: true,
      });

      AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        this.showAd = true
      });

      AdMob.addListener(BannerAdPluginEvents.Opened, () => {
        this.showAd = true
      });

      AdMob.addListener(BannerAdPluginEvents.Closed, () => {
        this.showAd = false
      });

      const options: BannerAdOptions = {
        // adId: 'ca-app-pub-3940256099942544/6300978111', // TEST AD ID
        adId: this.platform === 'android' ? 'ca-app-pub-7719091147897476/6009621957' : 'ca-app-pub-7719091147897476~1773759825',
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.TOP_CENTER,
        margin: 0,
        isTesting: true,
        npa: true
      };

      AdMob.showBanner(options);

      // const options: AdOptions = {
      //   adId: 'ca-app-pub-7719091147897476/5728228969',
      //   // isTesting: true
      //   // npa: true
      // };
      // await AdMob.prepareInterstitial(options);
      // await AdMob.showInterstitial();
    }
  }
}
</script>

<style scoped>
.page {
  flex: 1;
  margin: auto 0 0 0;
  transition: flex 1s ease-in-out;
}

.ad-spacing {
  flex: 0.965;
}
</style>