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

const ALLOWED_EMAIL_DOMAIN = "@vitbhopal.ac.in";
const ADMIN_EMAIL = "growthcastle3@gmail.com";

// Check if email is allowed (admin or VIT Bhopal domain)
const isEmailAllowed = (email: string): boolean => {
  const lowerEmail = email.toLowerCase();
  if (lowerEmail === ADMIN_EMAIL.toLowerCase()) return true;
  return lowerEmail.endsWith(ALLOWED_EMAIL_DOMAIN);
};

// Helper function to decode JWT and extract email
const decodeJWT = (token: string): { email?: string; sub?: string } => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return {};
  }
};

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
      // Check if there's an error in the URL (from Supabase trigger rejection)
      const error_description = fragmentParams.get("error_description");
      const error_message = fragmentParams.get("error");
      
      if (error_description?.includes("vitbhopal.ac.in") || error_description?.includes("VIT Bhopal")) {
        showToast("🚨 Use VIT BPL college email to Login", 3000);
      } else if (error_message || error_description) {
        showToast("🚨 Use VIT BPL college email to Login", 3000);
      } else {
        showToast("Sign in was cancelled", 2000);
      }
      throw new Error("Missing token(s)");
    }

    // ✅ Validate email domain BEFORE creating session
    const payload = decodeJWT(access_token);
    const userEmail = payload.email;

    if (!userEmail) {
      showToast("Unable to verify email. Please try again", 3000);
      throw new Error("No email in token");
    }

    if (!isEmailAllowed(userEmail)) {
      showToast("Use VIT BPL college email", 3000);
      throw new Error("Invalid email domain");
    }

    // ✅ Only create session if email domain is valid
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      showToast("Failed to sign in. Please try again", 3000);
      throw error;
    }
  } catch (err: any) {
    // Toast message is already shown above for each specific error
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
  
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

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

