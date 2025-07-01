import { useState } from 'react';

export const useWelcomeModal = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Remove the useEffect that was auto-showing the modal

  const closeWelcome = () => {
    setShowWelcome(false);
  };

  const showWelcomeManually = () => {
    console.log('showWelcomeManually called - setting showWelcome to true');
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