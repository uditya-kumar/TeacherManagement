// src/libs/auth.ts
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase, supabaseUrl } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

// Build ONE redirect URI that matches what you whitelisted in Supabase
const redirectTo = makeRedirectUri({
  scheme: "vitsify",
  path: "auth/callback",
  preferLocalhost: false, // don't fall back to exp://localhost
});
console.log("🔗 redirectTo =", redirectTo);

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token } = params;
  if (!access_token || !refresh_token) throw new Error("Missing token(s)");

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
};

export const googleSignIn = async () => {
  // Ask supabase for the OAuth URL
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,              // MUST equal the one in Supabase list
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("No auth URL from Supabase");

  // Open the auth session
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  console.log("AuthSession result:", res);

  if (res.type === "success" && res.url) {
    await createSessionFromUrl(res.url);
    return;
  }
  throw new Error("Authentication cancelled or failed");
};

// Optional: call at app start to catch magic links / password reset etc.
export const useInitialUrlHandler = () => {
  const url = Linking.useURL();
  if (url) {
    createSessionFromUrl(url).catch(console.error);
  }
};
