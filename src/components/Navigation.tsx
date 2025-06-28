import { Button } from "@/components/ui/button";
import { Music, Home, Upload, LogOut, Menu, X, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PlaylistViewer from "@/components/PlaylistViewer";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: any }) => (
    <Link
      to={to}
      className={`flex items-center justify-center space-x-2 px-4 py-2 h-10 rounded-lg transition-all duration-200 font-medium text-sm ${
        isActive(to)
          ? 'bg-purple-600 text-white shadow-md'
          : 'text-white/80 hover:text-white hover:bg-purple-600/20 hover:shadow-sm'
      }`}
      onClick={() => setMobileMenuOpen(false)}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{children}</span>
    </Link>
  );

  const NavButton = ({ onClick, children, icon: Icon, variant = "ghost" }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    icon: any;
    variant?: "ghost" | "outline";
  }) => (
    <Button
      onClick={onClick}
      variant={variant}
      className={`flex items-center justify-center space-x-2 px-4 py-2 h-10 rounded-lg transition-all duration-200 font-medium text-sm ${
        variant === "outline" 
          ? "border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white hover:border-purple-400 shadow-sm hover:shadow-md"
          : "text-white/80 hover:text-white hover:bg-purple-600/20 hover:shadow-sm"
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{children}</span>
    </Button>
  );

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Music className="h-8 w-8 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Song Monk</h1>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-2">
              <NavLink to="/" icon={Home}>Browse</NavLink>
              <NavLink to="/submit" icon={Upload}>Submit Song</NavLink>
              <PlaylistViewer
                trigger={
                  <NavButton
                    onClick={() => {}}
                    icon={Music}
                  >
                    My Playlists
                  </NavButton>
                }
              />
              <NavLink to="/profile" icon={User}>Profile</NavLink>
              <NavButton
                onClick={signOut}
                icon={LogOut}
                variant="outline"
              >
                Sign Out
              </NavButton>
            </nav>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-purple-600/20 p-2 h-10 w-10 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && mobileMenuOpen && (
          <nav className="mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col space-y-2">
              <NavLink to="/" icon={Home}>Browse</NavLink>
              <NavLink to="/submit" icon={Upload}>Submit Song</NavLink>
              <div className="px-3 py-2">
                <PlaylistViewer
                  trigger={
                    <NavButton
                      onClick={() => {}}
                      icon={Music}
                    >
                      My Playlists
                    </NavButton>
                  }
                />
              </div>
              <NavLink to="/profile" icon={User}>Profile</NavLink>
              <div className="px-3 py-2">
                <NavButton
                  onClick={signOut}
                  icon={LogOut}
                  variant="outline"
                >
                  Sign Out
                </NavButton>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;