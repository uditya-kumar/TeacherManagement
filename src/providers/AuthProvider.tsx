import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/libs/supabase";
import { Tables } from "@/types";

type Profile = Tables<"profiles">;

type AuthData = {
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
};

const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
  profile: null,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchUserProfile = async (userId: string) => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (!isMountedRef.current) return;
        setProfile(data || null);
      } catch (_err) {
        if (!isMountedRef.current) return;
        setProfile(null);
      }
    };

    // ✅ Single source of truth: onAuthStateChange handles ALL auth state
    // INITIAL_SESSION fires on mount with the persisted session (or null)
    // This eliminates race conditions from calling both getSession() and onAuthStateChange
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMountedRef.current) return;

        switch (event) {
          case "INITIAL_SESSION":
          case "SIGNED_IN":
          case "TOKEN_REFRESHED": {
            setSession(newSession);
            const userId = newSession?.user?.id;
            if (userId) {
              void fetchUserProfile(userId);
            } else {
              setProfile(null);
            }
            setLoading(false);
            break;
          }
          case "USER_UPDATED": {
            // ✅ Handle user metadata updates (e.g., email change, profile update via auth)
            setSession(newSession);
            const userId = newSession?.user?.id;
            if (userId) {
              void fetchUserProfile(userId);
            }
            break;
          }
          case "SIGNED_OUT": {
            setSession(null);
            setProfile(null);
            setLoading(false);
            break;
          }
          case "PASSWORD_RECOVERY": {
            // User clicked password recovery link - session is available
            setSession(newSession);
            setLoading(false);
            break;
          }
          default: {
            // No-op for other events (MFA_CHALLENGE_VERIFIED, etc.)
            break;
          }
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
