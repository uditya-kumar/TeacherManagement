// src/libs/auth.ts
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";
import { useEffect } from "react";
import { useLinkingURL } from "expo-linking";
import { showToast } from "./toastService";

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

    if (!access_token || !refresh_token) {
      // Check if there's an error in the URL (from Supabase database trigger rejection)
      const error_description = fragmentParams.get("error_description");
      const error_message = fragmentParams.get("error");

      if (error_description || error_message) {
        // Database rejected the email domain
        showToast("Login using VIT Bhopal email", 3000);
      } else {
        showToast("Sign in was cancelled", 2000);
      }
      throw new Error("Missing token(s)");
    }

    // Create session - database handles email domain validation
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      // Check if error is related to email domain validation from database
      if (
        error.message?.includes("vitbhopal") ||
        error.message?.includes("VIT Bhopal")
      ) {
        showToast("Login using VIT Bhopal email", 3000);
      } else {
        showToast("Failed to sign in. Please try again", 3000);
      }
      throw error;
    }
  } catch (err: any) {
    // Only log in development for debugging
    if (__DEV__) {
      console.log("Auth error:", err?.message || err);
    }
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

  if (error) {
    showToast("Unable to start sign in. Please try again", 3000);
    throw error;
  }

  if (!data?.url) {
    showToast("Unable to start sign in. Please try again", 3000);
    throw new Error("No auth URL from Supabase");
  }

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    createTask: false,
  });

  if (res.type === "success" && res.url) {
    await createSessionFromUrl(res.url);
    return;
  }

  // User cancelled or closed the browser
  if (res.type === "cancel") {
    showToast("Sign in was cancelled", 2000);
    throw new Error("Authentication cancelled");
  }

  showToast("Sign in failed. Please try again", 3000);
  throw new Error("Authentication failed");
};

export const useInitialUrlHandler = () => {
  const url = useLinkingURL();

  useEffect(() => {
    if (url?.startsWith("vitsify:///")) {
      createSessionFromUrl(url).catch(() => {
        // Toast message is already shown in createSessionFromUrl
        // Silent catch to prevent unhandled promise rejection
      });
    }
  }, [url]);
};
