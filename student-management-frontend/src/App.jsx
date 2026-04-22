import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import FormPage from "./pages/FormPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useState, useEffect } from "react";
import { isAuthenticated } from "./services/authService";

export default function App() {
  const [view, setView] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [view]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setView("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView("landing");
  };

  // Protected Route Logic
  const renderView = () => {
    if ((view === "dashboard" || view === "form") && !isLoggedIn) {
      setView("login");
      return null;
    }

    switch (view) {
      case "landing":
        return <Landing onStart={() => setView(isLoggedIn ? "dashboard" : "login")} />;
      case "login":
        return <Login onLoginSuccess={handleLoginSuccess} onNavigateSignup={() => setView("signup")} />;
      case "signup":
        return <Signup onSignupSuccess={() => setView("login")} onNavigateLogin={() => setView("login")} />;
      case "dashboard":
        return <Dashboard onAddStudent={() => setView("form")} />;
      case "form":
        return <FormPage onCancel={() => setView("dashboard")} onSuccess={() => setView("dashboard")} />;
      default:
        return <Landing onStart={() => setView(isLoggedIn ? "dashboard" : "login")} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar setView={setView} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      
      <div className="flex-grow transition-all duration-300">
        {renderView()}
      </div>

      {view !== "landing" && (
        <div className="flex justify-center pb-10">
           <button 
            onClick={() => setView("landing")}
            className="text-slate-400 text-sm hover:underline"
          >
            &larr; Back to Landing Page
          </button>
        </div>
      )}

      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200 mt-auto">
        &copy; 2024 Student Management System. Built with Vite + Tailwind.
      </footer>
    </div>
  );
}


