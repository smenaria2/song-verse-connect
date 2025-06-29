import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Upload, Star, ListMusic, Play, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTimeUser?: boolean;
}

const WelcomeModal = ({ isOpen, onClose, isFirstTimeUser = false }: WelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const features = [
    {
      icon: Music,
      title: "Discover Sacred Music",
      description: "Explore a curated collection of spiritual and meaningful songs from around the world",
      color: "text-purple-400",
      bgColor: "bg-purple-600/20"
    },
    {
      icon: Upload,
      title: "Submit Songs",
      description: "Share your favorite YouTube music videos with our community and help others discover new songs",
      color: "text-orange-400",
      bgColor: "bg-orange-600/20"
    },
    {
      icon: Star,
      title: "Write Reviews",
      description: "Rate and review songs to help others find the best music. Share your thoughts and experiences",
      color: "text-yellow-400",
      bgColor: "bg-yellow-600/20"
    },
    {
      icon: ListMusic,
      title: "Create Playlists",
      description: "Organize your favorite songs into custom playlists and share them with the community",
      color: "text-green-400",
      bgColor: "bg-green-600/20"
    },
    {
      icon: Play,
      title: "Built-in Player",
      description: "Listen to any song directly on the platform with our integrated YouTube player",
      color: "text-blue-400",
      bgColor: "bg-blue-600/20"
    }
  ];

  const nextStep = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 border-white/20 text-white max-w-2xl backdrop-blur-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center">
              <Music className="h-8 w-8 text-purple-400 mr-3" />
              {isFirstTimeUser ? "Welcome to Song Monk!" : "Welcome Back!"}
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="text-center">
            <p className="text-white/80 text-lg mb-6">
              {isFirstTimeUser 
                ? "Discover the power of music in your spiritual journey. Here's what you can do:"
                : "Continue your musical journey with these amazing features:"
              }
            </p>
          </div>

          {/* Feature Showcase */}
          <Card className={`${features[currentStep].bgColor} border-white/20 backdrop-blur-sm transition-all duration-500`}>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className={`${features[currentStep].bgColor} rounded-full p-4 inline-block`}>
                    {React.createElement(features[currentStep].icon, {
                      className: `h-12 w-12 ${features[currentStep].color}`
                    })}
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-pulse"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-white">
                  {features[currentStep].title}
                </h3>
                
                <p className="text-white/90 text-lg leading-relaxed max-w-md mx-auto">
                  {features[currentStep].description}
                </p>

                {/* Feature-specific action button */}
                {currentStep === 1 && (
                  <Link to="/submit">
                    <Button 
                      onClick={onClose}
                      className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Try Submitting a Song
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-purple-400 scale-125 shadow-lg' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              Previous
            </Button>

            <span className="text-white/60 text-sm">
              {currentStep + 1} of {features.length}
            </span>

            <Button
              onClick={nextStep}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {currentStep === features.length - 1 ? (
                <>
                  Get Started
                  <Music className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Quick Start Actions */}
          {currentStep === features.length - 1 && (
            <div className="border-t border-white/20 pt-6">
              <p className="text-center text-white/80 mb-4">Ready to start your musical journey?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link to="/submit">
                  <Button 
                    onClick={onClose}
                    variant="outline" 
                    className="w-full border-orange-500/50 bg-orange-600/20 text-orange-300 hover:bg-orange-600/30"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Your First Song
                  </Button>
                </Link>
                <Button 
                  onClick={onClose}
                  variant="outline" 
                  className="w-full border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Explore & Review Songs
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;