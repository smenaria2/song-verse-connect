import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AudioPlayerProvider } from "@/hooks/useAudioPlayer";
import GlobalMiniPlayer from "@/components/GlobalMiniPlayer";
import Index from "./pages/Index";
import Submit from "./pages/Submit";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Auth from "./pages/Auth";
import Song from "./pages/Song";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AudioPlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/song/:id" element={<Song />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <GlobalMiniPlayer />
          </BrowserRouter>
        </TooltipProvider>
      </AudioPlayerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;