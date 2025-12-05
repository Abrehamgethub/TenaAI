import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface UseIdleLogoutOptions {
  idleTime?: number; // Time in milliseconds before logout (default: 15 minutes)
  onLogout?: () => void; // Optional callback before logout
  enabled?: boolean; // Whether idle logout is enabled
}

/**
 * Hook that automatically logs out the user after a period of inactivity
 * @param options - Configuration options for idle logout
 */
export const useIdleLogout = ({
  idleTime = 15 * 60 * 1000, // Default: 15 minutes
  onLogout,
  enabled = true,
}: UseIdleLogoutOptions = {}) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset the idle timer
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (enabled) {
      timeoutRef.current = setTimeout(async () => {
        try {
          // Call optional callback before logout
          if (onLogout) {
            onLogout();
          }
          
          // Sign out from Firebase
          await signOut(auth);
          
          // Redirect to login page
          navigate('/login', { 
            replace: true,
            state: { message: 'You were logged out due to inactivity.' }
          });
        } catch (error) {
          console.error('Error during idle logout:', error);
        }
      }, idleTime);
    }
  }, [idleTime, navigate, onLogout, enabled]);

  // Handle user activity events
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) return;

    // Events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'wheel',
    ];

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleActivity, resetTimer, enabled]);

  // Return useful values for components
  return {
    resetTimer,
    lastActivity: lastActivityRef.current,
    remainingTime: idleTime - (Date.now() - lastActivityRef.current),
  };
};

export default useIdleLogout;
