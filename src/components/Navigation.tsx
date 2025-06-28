import { Button } from "@/components/ui/button";
import { Music, Home, Upload, LogOut, Menu, X, User, LogIn } from "lucide-react";
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

  const isActive = (path: string) => location.pathname === path;

  // Unified button styling for ALL navigation buttons
  const baseButtonClasses = "flex items-center justify-center space-x-2 px-4 py-2 h-10 rounded-lg transition-all duration-200 font-medium text-sm text-white/80 hover:text-white hover:bg-purple-600/20 hover:shadow-sm border-0 bg-transparent";
  const activeButtonClasses = "bg-purple-600/30 text-white shadow-sm";
  const loginButtonClasses = "flex items-center justify-center space-x-2 px-6 py-2 h-10 rounded-lg transition-all duration-300 font-medium text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:shadow-lg hover:scale-105 border-0 transform";

  const NavLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: any }) => (
    <Link
      to={to}
      className={`${baseButtonClasses} ${isActive(to) ? activeButtonClasses : ''}`}
      onClick={() => setMobileMenuOpen(false)}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{children}</span>
    </Link>
  );

  const NavButton = ({ onClick, children, icon: Icon }: { 
    onClick: () => void; 
    children: React.ReactNode; 
    icon: any;
  }) => (
    <Button
      onClick={onClick}
      className={baseButtonClasses}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{children}</span>
    </Button>
  );

  const LoginButton = () => (
    <Link to="/auth" className={loginButtonClasses}>
      <LogIn className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">Sign In</span>
    </Link>
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
              {user ? (
                <>
                  <NavLink to="/" icon={Home}>Browse</NavLink>
                  <NavLink to="/submit" icon={Upload}>Submit Song</NavLink>
                  <PlaylistViewer
                    trigger={
                      <div className={baseButtonClasses}>
                        <Music className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">My Playlists</span>
                      </div>
                    }
                  />
                  <NavLink to="/profile" icon={User}>Profile</NavLink>
                  <NavButton
                    onClick={signOut}
                    icon={LogOut}
                  >
                    Sign Out
                  </NavButton>
                </>
              ) : (
                <>
                  <NavLink to="/" icon={Home}>Browse</NavLink>
                  <LoginButton />
                </>
              )}
            </nav>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              {!user && <LoginButton />}
              <Button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:bg-purple-600/20 p-2 h-10 w-10 rounded-lg transition-all duration-200 border-0 bg-transparent"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && mobileMenuOpen && (
          <nav className="mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col space-y-2">
              <NavLink to="/" icon={Home}>Browse</NavLink>
              {user ? (
                <>
                  <NavLink to="/submit" icon={Upload}>Submit Song</NavLink>
                  <div className="px-3 py-2">
                    <PlaylistViewer
                      trigger={
                        <div className={baseButtonClasses}>
                          <Music className="h-4 w-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">My Playlists</span>
                        </div>
                      }
                    />
                  </div>
                  <NavLink to="/profile" icon={User}>Profile</NavLink>
                  <div className="px-3 py-2">
                    <NavButton
                      onClick={signOut}
                      icon={LogOut}
                    >
                      Sign Out
                    </NavButton>
                  </div>
                </>
              ) : (
                <div className="px-3 py-2">
                  <LoginButton />
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;