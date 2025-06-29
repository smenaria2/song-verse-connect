import { Button } from "@/components/ui/button";
import { DivideIcon as LucideIcon } from "lucide-react";

interface ProfileButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  icon: LucideIcon;
  variant?: "outline" | "default";
  disabled?: boolean;
}

const ProfileButton = ({ onClick, children, icon: Icon, variant = "outline", disabled = false }: ProfileButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size="sm"
      className={`flex items-center justify-center space-x-2 px-4 py-2 h-10 rounded-lg transition-all duration-200 font-medium text-sm ${
        variant === "default"
          ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
          : variant === "outline" && disabled
          ? "border-gray-500/50 bg-gray-600/20 text-gray-400 cursor-not-allowed"
          : "border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white hover:border-purple-400 shadow-sm hover:shadow-md"
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">{children}</span>
    </Button>
  );
};

export const CancelButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    variant="outline"
    size="sm"
    className="flex items-center justify-center space-x-2 px-4 py-2 h-10 rounded-lg transition-all duration-200 font-medium text-sm border-red-500/50 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-white hover:border-red-400 shadow-sm hover:shadow-md"
  >
    <span className="whitespace-nowrap">Cancel</span>
  </Button>
);

export default ProfileButton;