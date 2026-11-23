import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.crustory.app",
  appName: "CRUSTORY",
  webDir: "native/www",
  server: {
    url: "https://crustory.vercel.app",
    cleartext: false,
    allowNavigation: [
      "crustory.vercel.app",
      "*.kakao.com",
      "kauth.kakao.com",
      "kapi.kakao.com",
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#f3f0e8",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#f3f0e8",
  },
};

export default config;
