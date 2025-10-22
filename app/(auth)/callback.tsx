import { useRouter } from "expo-router";
import { useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { Text } from "~/components/ui/text"; // Adjust import based on your setup

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Parse URL hash parameters (e.g., #access_token=...&refresh_token=...)
        const hash = window.location.hash.substring(1); // Remove '#'
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          router.replace("/"); // Redirect to home on success
        } else {
          throw new Error(
            "No access token or refresh token found in callback URL"
          );
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.replace("/login?error=auth-failed"); // Redirect with error
      }
    };

    // Run only on web (for native, rely on Linking or WebBrowser callback)
    if (typeof window !== "undefined") {
      handleAuth();
    }
  }, []);

  return <Text>Processing authentication...</Text>;
}
