import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

const LoginButton = () => {
  const loginButtonClasses = "flex items-center justify-center space-x-2 px-6 py-2 h-10 rounded-lg transition-all duration-300 font-medium text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:shadow-lg hover:scale-105 border-0 transform";

  return (
    <Link to="/auth" className={loginButtonClasses}>
      <LogIn className="h-4 w-4 flex-shrink-0" />
      <span className="whitespace-nowrap">Sign In</span>
    </Link>
  );
};

export default LoginButton;