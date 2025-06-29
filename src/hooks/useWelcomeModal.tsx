import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useWelcomeModal = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Check if user has seen welcome before
      const hasSeenWelcome = localStorage.getItem(`welcome_seen_${user.id}`);
      const userCreatedAt = new Date(user.created_at || '');
      const now = new Date();
      const timeDiff = now.getTime() - userCreatedAt.getTime();
      const isNewUser = timeDiff < 24 * 60 * 60 * 1000; // Less than 24 hours old

      if (!hasSeenWelcome) {
        setIsFirstTime(isNewUser);
        setShowWelcome(true);
      }
    } else {
      // Show welcome for unauthenticated users if they haven't seen it
      const hasSeenGuestWelcome = localStorage.getItem('guest_welcome_seen');
      if (!hasSeenGuestWelcome) {
        setIsFirstTime(false);
        setShowWelcome(true);
      }
    }
  }, [user]);

  const closeWelcome = () => {
    setShowWelcome(false);
    if (user) {
      localStorage.setItem(`welcome_seen_${user.id}`, 'true');
    } else {
      localStorage.setItem('guest_welcome_seen', 'true');
    }
  };

  const showWelcomeManually = () => {
    setIsFirstTime(false);
    setShowWelcome(true);
  };

  return {
    showWelcome,
    isFirstTime,
    closeWelcome,
    showWelcomeManually
  };
};