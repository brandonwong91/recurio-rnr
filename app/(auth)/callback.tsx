import { useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { Text } from "~/components/ui/text"; // Adjust import based on your setup

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Parse URL query parameters (works on web due to window.location)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const accessToken = urlParams.get("access_token");

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );
          if (error) throw error;
          router.replace("/");
        } else if (accessToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: urlParams.get("refresh_token") || "",
          });
          if (error) throw error;
          router.replace("/");
        } else {
          throw new Error("No auth code or token found");
        }
      } catch (error) {
        console.error("Auth error:", error);
        router.replace("/login?error=auth-failed");
      }
    };

    // Run only on web (for native, rely on Linking or WebBrowser callback)
    if (typeof window !== "undefined") {
      handleAuth();
    }
  }, []);

  return <Text>Processing authentication...</Text>;
}
