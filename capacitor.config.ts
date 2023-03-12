import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ridhtech.proabsen',
  appName: 'pro absen',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '723073598683-21fhhrmq3kkq1t6s3trpg6pfsf0bnh5j.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
};

export default config;
