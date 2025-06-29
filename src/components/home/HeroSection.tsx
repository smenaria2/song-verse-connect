import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="text-center mb-12 animate-in slide-in-from-top-6">
      <h1 className="text-2xl md:text-6xl font-bold text-white mb-4 text-break">
        Discover Sacred Music
      </h1>
      <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto text-break px-4">
        Share, review, and explore the most meaningful songs in your spiritual journey
      </p>
    </div>
  );
};

export default HeroSection;