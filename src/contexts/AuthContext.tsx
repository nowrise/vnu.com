import { useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./auth-context";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const ADMIN_CACHE_KEY = "admin_status_cache";
  const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  const getCachedAdminStatus = (userId: string): boolean | null => {
    try {
      const cached = sessionStorage.getItem(ADMIN_CACHE_KEY);
      if (!cached) return null;
      
      const { userId: cachedUserId, isAdmin, timestamp } = JSON.parse(cached);
      
      // Validate cache: same user and not expired
      if (cachedUserId === userId && Date.now() - timestamp < CACHE_DURATION_MS) {
        return isAdmin;
      }
      
      // Clear invalid/expired cache
      sessionStorage.removeItem(ADMIN_CACHE_KEY);
      return null;
    } catch {
      sessionStorage.removeItem(ADMIN_CACHE_KEY);
      return null;
    }
  };

  const setCachedAdminStatus = (userId: string, isAdmin: boolean) => {
    try {
      sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({
        userId,
        isAdmin,
        timestamp: Date.now(),
      }));
    } catch {
      // Ignore storage errors
    }
  };

  const clearAdminCache = () => {
    try {
      sessionStorage.removeItem(ADMIN_CACHE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  const checkAdminRole = async (accessToken: string, userId: string, forceRefresh = false) => {
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = getCachedAdminStatus(userId);
      if (cached !== null) {
        if (import.meta.env.DEV) console.log("Using cached admin status:", cached);
        return cached;
      }
    }

    try {
      if (import.meta.env.DEV) console.log("Checking admin role via edge function...");
      // Call backend edge function for secure server-side admin check
      const { data, error } = await supabase.functions.invoke("check-admin", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (import.meta.env.DEV) console.log("Admin check response:", { data, error });

      if (error) {
        if (import.meta.env.DEV) console.error("Error checking admin role:", error);
        // Clear cache on error to allow retry
        clearAdminCache();
        return false;
      }
      
      const isAdmin = data?.isAdmin === true;
      if (import.meta.env.DEV) console.log("Admin status result:", isAdmin);
      setCachedAdminStatus(userId, isAdmin);
      return isAdmin;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error checking admin role:", error);
      clearAdminCache();
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (import.meta.env.DEV) console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (session?.user && session.access_token) {
          // Force refresh on sign in events to ensure fresh admin check
          const forceRefresh = event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED';
          setTimeout(() => {
            checkAdminRole(session.access_token, session.user.id, forceRefresh).then(setIsAdmin);
          }, 0);
        } else {
          setIsAdmin(false);
          clearAdminCache();
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user && session.access_token) {
        checkAdminRole(session.access_token, session.user.id).then(setIsAdmin);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    return { error: error as Error | null };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?reset=true`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    clearAdminCache();
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        signUp,
        signIn,
        signInWithGoogle,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
