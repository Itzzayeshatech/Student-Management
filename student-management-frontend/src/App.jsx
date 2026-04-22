import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";

export default function App() {
  const [view, setView] = useState("landing");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Simple conditional routing for demo */}
      <div className="transition-all duration-300">
        {view === "landing" && (
          <>
            <Landing />
            <div className="flex justify-center pb-20">
              <button 
                onClick={() => setView("dashboard")}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Go to Dashboard &rarr;
              </button>
            </div>
          </>
        )}
        
        {view === "dashboard" && (
          <>
            <Dashboard />
            <div className="flex justify-center pb-20">
              <button 
                onClick={() => setView("landing")}
                className="text-slate-500 font-semibold hover:underline"
              >
                &larr; Back to Home
              </button>
            </div>
          </>
        )}
      </div>

      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200">
        &copy; 2024 Student Management System. Built with Vite + Tailwind.
      </footer>
    </div>
  );
}
