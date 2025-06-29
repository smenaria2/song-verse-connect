import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useWelcomeModal = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Check if user has seen welcome before using user ID
      const welcomeKey = `welcome_seen_${user.id}`;
      const hasSeenWelcome = localStorage.getItem(welcomeKey);
      
      // Check if user is new (created within last 24 hours)
      const userCreatedAt = new Date(user.created_at || '');
      const now = new Date();
      const timeDiff = now.getTime() - userCreatedAt.getTime();
      const isNewUser = timeDiff < 24 * 60 * 60 * 1000; // Less than 24 hours old

      // Only show welcome if user hasn't seen it before
      if (!hasSeenWelcome) {
        setIsFirstTime(isNewUser);
        setShowWelcome(true);
      }
    } else {
      // For unauthenticated users, check if they've seen the guest welcome
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
      // Mark as seen for this specific user
      localStorage.setItem(`welcome_seen_${user.id}`, 'true');
    } else {
      // Mark as seen for guest users
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