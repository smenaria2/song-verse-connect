import { Button } from "@/components/ui/button";
import { DivideIcon as LucideIcon } from "lucide-react";

interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  icon: LucideIcon;
}

const NavButton = ({ onClick, children, icon: Icon }: NavButtonProps) => {
  const baseButtonClasses = "flex items-center justify-center space-x-2 px-4 py-2 h-10 rounded-lg transition-all duration-200 font-medium text-sm text-white/80 hover:text-white hover:bg-purple-600/20 hover:shadow-sm border-0 bg-transparent";

  return (
    <Button
      onClick={onClick}
      className={baseButtonClasses}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{children}</span>
    </Button>
  );
};

export default NavButton;