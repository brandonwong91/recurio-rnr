import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Constants from "expo-constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  // Add debug logs
  console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
  console.log(
    "🔍 Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL:",
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL
  );
  console.log(
    "🔍 process.env.EXPO_PUBLIC_API_BASE_URL:",
    process.env.EXPO_PUBLIC_API_BASE_URL
  );

  if (process.env.NODE_ENV === "development") {
    const experienceUrl = Constants.experienceUrl;
    console.log("🔍 experienceUrl:", experienceUrl);

    const origin = experienceUrl
      ? experienceUrl.replace("exp://", "http://")
      : "http://localhost:8081";

    console.log("🔍 Using dev origin:", origin);
    return origin.concat(path);
  }

  // 2️⃣ Production / Standalone build
  // Try reading from Constants first (works better in EAS builds)
  const fromConstants = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL;
  if (fromConstants) {
    console.log("✅ Using API base from Constants:", fromConstants);
    return fromConstants.concat(path);
  }

  // Fallback to process.env if Constants is undefined
  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error(
      "❌ EXPO_PUBLIC_API_BASE_URL is not defined in production build."
    );
  }

  console.log(
    "✅ Using API base from process.env:",
    process.env.EXPO_PUBLIC_API_BASE_URL
  );
  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};
