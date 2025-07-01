import { useAuth } from "@/hooks/useAuth";
import { useWelcomeModal } from "@/hooks/useWelcomeModal";
import WelcomeModal from "@/components/WelcomeModal";
import { HelpCircle } from "lucide-react";

const HeroSection = () => {
  const { user } = useAuth();
  const { showWelcome, isFirstTime, closeWelcome, showWelcomeManually } = useWelcomeModal();

  const handleHowItWorks = () => {
    console.log('How It Works button clicked');
    console.log('Current showWelcome state:', showWelcome);
    showWelcomeManually();
    console.log('showWelcomeManually called');
  };

  return (
    <>
      <div className="text-center mb-12 animate-in slide-in-from-top-6">
        <h1 className="text-2xl md:text-6xl font-bold text-white mb-4 text-break">
          Discover Sacred Music
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto text-break px-4">
          Share, review, and explore the most meaningful songs in your spiritual journey
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={handleHowItWorks}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200 backdrop-blur-sm"
          >
            <HelpCircle size={18} />
            How It Works
          </button>
        </div>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={closeWelcome} 
        isFirstTimeUser={isFirstTime} 
      />
    </>
  );
};

export default HeroSection;