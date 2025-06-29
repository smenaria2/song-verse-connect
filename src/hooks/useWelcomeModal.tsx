import { useState, useEffect } from 'react'; // Keep useState and useEffect for other potential uses or future features, but the auto-popup useEffect is removed
import { useAuth } from '@/hooks/useAuth';

export const useWelcomeModal = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false); // This state can be managed differently or removed if its only purpose was tied to auto-popup
  const { user } = useAuth(); // Keep this if 'user' is used elsewhere, like for setting localStorage flags on close

  // REMOVE OR COMMENT OUT THIS ENTIRE useEffect BLOCK TO DISABLE AUTOMATIC POP-UP
  /*
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
  }, [user]); // This dependency array ensures it runs when user changes
  */

  const closeWelcome = () => {
    setShowWelcome(false);
    // It's good practice to still mark as seen when manually closed,
    // so it doesn't pop up again if the user triggers it manually, closes it, and then re-triggers.
    if (user) {
      localStorage.setItem(`welcome_seen_${user.id}`, 'true');
    } else {
      localStorage.setItem('guest_welcome_seen', 'true');
    }
  };

  const showWelcomeManually = () => {
    // When manually triggered, you probably don't want it to show as "first time user"
    // unless you explicitly re-implement that logic here based on a specific scenario.
    setIsFirstTime(false); 
    setShowWelcome(true);
  };

  return {
    showWelcome,
    isFirstTime, // Keep this, as your WelcomeModal component still uses it for conditional text
    closeWelcome,
    showWelcomeManually
  };
};