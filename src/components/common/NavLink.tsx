import { Link, useLocation } from "react-router-dom";
import { DivideIcon as LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon: LucideIcon;
  onClick?: () => void;
}

const NavLink = ({ to, children, icon: Icon, onClick }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  const baseButtonClasses = "flex items-center justify-center space-x-2 px-4 py-2 h-10 rounded-lg transition-all duration-200 font-medium text-sm text-white/80 hover:text-white hover:bg-purple-600/20 hover:shadow-sm border-0 bg-transparent";
  const activeButtonClasses = "bg-purple-600/30 text-white shadow-sm";

  return (
    <Link
      to={to}
      className={`${baseButtonClasses} ${isActive ? activeButtonClasses : ''}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{children}</span>
    </Link>
  );
};

export default NavLink;