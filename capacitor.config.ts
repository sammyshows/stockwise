import { CapacitorConfig } from '@capacitor/cli';

let config: CapacitorConfig;

const baseConfig: CapacitorConfig = {
  appId: 'app.stockwise.twa',
  appName: 'Stockwise',
  webDir: '.output/public',
  bundledWebRuntime: false,
  // server: {
  //   hostname: "www.stockwise.app",
  //   iosScheme: 'https',
  //   androidScheme: 'https'
  // }
};

switch (process.env.NODE_ENV) {
  case 'qa':
    config = {
      ...baseConfig,
      // ios: {
      //   scheme: 'dev',
      // },
      // android: {
      //   flavor: 'dev',
      // },
    };
    break;
  default:
    config = {
      ...baseConfig,
      // ios: {
      //   scheme: 'prod',
      // },
      // android: {
      //   flavor: 'prod',
      // },
    };
    break;
}

export default config;