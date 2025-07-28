// src/libs/auth.ts
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";
import { useEffect } from "react";
import { useLinkingURL } from "expo-linking"; // ✅ New hook


WebBrowser.maybeCompleteAuthSession();

// Build ONE redirect URI that matches what you whitelisted in Supabase
const redirectTo = makeRedirectUri({
  scheme: "vitsify",
  path: "/",
  preferLocalhost: false, // don't fall back to exp://localhost
});

const createSessionFromUrl = async (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const fragment = parsedUrl.hash.startsWith("#")
      ? parsedUrl.hash.slice(1)
      : parsedUrl.hash;

    const fragmentParams = new URLSearchParams(fragment);
    const access_token = fragmentParams.get("access_token");
    const refresh_token = fragmentParams.get("refresh_token");

    if (!access_token || !refresh_token) throw new Error("Missing token(s)");

    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) throw error;
  } catch (err) {
    console.error("❌ Error creating session from URL:", err);
    throw err;
  }
};

export const googleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error("No auth URL from Supabase");

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (res.type === "success" && res.url) {
    await createSessionFromUrl(res.url);
    return;
  }

  throw new Error("Authentication cancelled or failed");
};

export const useInitialUrlHandler = () => {
  const url = useLinkingURL(); 

  useEffect(() => {
    if (url?.startsWith("vitsify:///")) {
      console.log("🔁 Handling auth callback from deep link");
      createSessionFromUrl(url).catch(console.error);
    }
  }, [url]);
};

