import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/libs/supabase";
import { Tables } from "@/types";

type Profile = Tables<'profiles'> ;

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

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async (userId: string) => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (!isMounted) return;
        setProfile(data || null);
      } catch (_err) {
        if (!isMounted) return;
        setProfile(null);
      }
    };

    const init = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(currentSession);
        // Do not block initial render on profile fetch
        if (currentSession?.user?.id) {
          void fetchUserProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void init();

    // ✅ Subscribe to auth changes (handles INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT)
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
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
            // Ensure we clear any loading state if still pending
            setLoading(false);
            break;
          }
          case "SIGNED_OUT": {
            setSession(null);
            setProfile(null);
            setLoading(false);
            break;
          }
          default: {
            // No-op for other events
            break;
          }
        }
      }
    );

    return () => {
      isMounted = false;
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
