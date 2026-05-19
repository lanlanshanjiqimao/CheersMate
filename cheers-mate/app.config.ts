import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Cheers Mate',
  slug: 'cheers-mate',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: 'cheersmate',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#6C5CE7',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.cheersmate.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#6C5CE7',
    },
    package: 'com.cheersmate.app',
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-router'],
  extra: {
    router: {
      origin: false,
    },
  },
});
