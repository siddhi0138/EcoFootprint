import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import AnimatedBackground from "../components/AnimatedBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-emerald-600 hover:text-emerald-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
