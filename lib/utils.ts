import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Constants from "expo-constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  if (process.env.NODE_ENV === "development") {
    // SAFELY check for experienceUrl and fall back to localhost if it's undefined.
    const experienceUrl = Constants.experienceUrl;

    const origin = experienceUrl
      ? experienceUrl.replace("exp://", "http://")
      : "http://localhost:8081"; // ⬅️ The essential fix: a safe fallback URL

    return origin.concat(path);
  }

  // 2. PRODUCTION/STANDALONE LOGIC
  // This correctly relies on the public environment variable set during the EAS build.
  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL environment variable is not defined for production."
    );
  }

  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};
