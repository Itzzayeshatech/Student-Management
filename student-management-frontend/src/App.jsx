import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import FormPage from "./pages/FormPage";
import { useState } from "react";

export default function App() {
  const [view, setView] = useState("landing");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar setView={setView} />
      
      <div className="transition-all duration-300">
        {view === "landing" && (
          <Landing onStart={() => setView("dashboard")} />
        )}
        
        {view === "dashboard" && (
          <Dashboard onAddStudent={() => setView("form")} />
        )}

        {view === "form" && (
          <FormPage onCancel={() => setView("dashboard")} onSuccess={() => setView("dashboard")} />
        )}
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

      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200">
        &copy; 2024 Student Management System. Built with Vite + Tailwind.
      </footer>
    </div>
  );
}
