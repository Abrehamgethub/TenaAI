import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

// Storage key for remember me preference
const REMEMBER_ME_KEY = 'qineguide_remember';

// Detect mobile device
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Get remember me preference from localStorage
const getRememberMe = (): boolean => {
  const stored = localStorage.getItem(REMEMBER_ME_KEY);
  return stored !== 'false'; // Default to true
};

// Set remember me preference
const setRememberMe = (value: boolean) => {
  localStorage.setItem(REMEMBER_ME_KEY, String(value));
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Initialize auth state listener
  useEffect(() => {
    let isMounted = true;
    
    // Check for redirect result first (mobile Google sign-in)
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && isMounted) {
          console.log('Redirect sign-in successful:', result.user.email);
          setUser(result.user);
        }
      } catch (error) {
        console.error('Redirect sign-in error:', error);
      }
    };
    
    checkRedirect();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isMounted) {
        setUser(currentUser);
        setInitializing(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Set persistence based on remember me preference
  const setAuthPersistence = useCallback(async (rememberMe: boolean) => {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    try {
      await setPersistence(auth, persistence);
      setRememberMe(rememberMe);
    } catch (error) {
      console.error('Failed to set persistence:', error);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = getRememberMe()) => {
    setLoading(true);
    try {
      await setAuthPersistence(rememberMe);
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }, [setAuthPersistence]);

  const register = useCallback(async (email: string, password: string, name: string, rememberMe: boolean = getRememberMe()) => {
    setLoading(true);
    try {
      await setAuthPersistence(rememberMe);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        // Refresh user to get updated profile
        setUser({ ...result.user });
      }
    } finally {
      setLoading(false);
    }
  }, [setAuthPersistence]);

  const loginWithGoogle = useCallback(async (rememberMe: boolean = getRememberMe()) => {
    setLoading(true);
    try {
      // Set persistence before sign-in
      await setAuthPersistence(rememberMe);
      
      // Try popup first for all devices (more reliable)
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google sign-in successful:', result.user.email);
        setUser(result.user);
        return;
      } catch (popupError: unknown) {
        const err = popupError as { code?: string };
        // If popup blocked or failed on mobile, fallback to redirect
        if (err.code === 'auth/popup-blocked' || 
            err.code === 'auth/popup-closed-by-user' ||
            (isMobile() && err.code === 'auth/cancelled-popup-request')) {
          console.log('Popup failed, trying redirect...');
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupError;
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('Google sign-in error:', err.code, err.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setAuthPersistence]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (user) {
      return user.getIdToken();
    }
    return null;
  }, [user]);

  const value = {
    user,
    loading,
    initializing,
    login,
    register,
    loginWithGoogle,
    logout,
    getIdToken,
  };

  // Show nothing while initializing to prevent flash
  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl animate-pulse">
            Q
          </div>
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
