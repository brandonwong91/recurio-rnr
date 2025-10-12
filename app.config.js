import "dotenv/config";

export default {
  expo: {
    name: "recurio-rnr",
    slug: "recurio-rnr",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.brandonwong91.recuriornr",
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/favicon.png",
      manifest: {
        name: "Recurio RNR",
        short_name: "Recurio",
        description: "A recurring grocery and payment tracker.",
        display: "standalone",
        start_url: "/",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "./assets/images/adaptive-icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./assets/images/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    },
    plugins: [
      [
        "expo-router",
        {
          origin: "https://recurio-rnr.vercel.app",
        },
      ],
      "@react-native-google-signin/google-signin",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      // 👇 Inject your environment variables dynamically
      EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      eas: {
        projectId: "ee66e4a2-5cfb-462d-affb-fed7c8329637",
      },
    },
  },
};
