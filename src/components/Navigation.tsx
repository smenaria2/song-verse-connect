
import { Button } from "@/components/ui/button";
import { Music, Home, Upload, LogOut, Menu, X } from "lucide-react";
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
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
        isActive(to)
          ? 'bg-purple-600 text-white'
          : 'text-white/80 hover:text-white hover:bg-purple-600/20'
      }`}
      onClick={() => setMobileMenuOpen(false)}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{children}</span>
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
              <NavLink to="/" icon={Home}>Browse</NavLink>
              <NavLink to="/submit" icon={Upload}>Submit Song</NavLink>
              <PlaylistViewer
                trigger={
                  <Button
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-purple-600/20 px-3 py-2"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    My Playlists
                  </Button>
                }
              />
              <NavLink to="/profile" icon={LogOut}>Profile</NavLink>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white ml-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </nav>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-purple-600/20 p-2"
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
                    <Button
                      variant="ghost"
                      className="text-white/80 hover:text-white hover:bg-purple-600/20 w-full justify-start px-0"
                    >
                      <Music className="h-4 w-4 mr-2" />
                      My Playlists
                    </Button>
                  }
                />
              </div>
              <NavLink to="/profile" icon={LogOut}>Profile</NavLink>
              <div className="px-3 py-2">
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;
