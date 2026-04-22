import { logout } from "../services/authService";

export default function Navbar({ setView, isLoggedIn, onLogout }) {
  const handleSignOut = () => {
    logout();
    if (onLogout) onLogout();
  };

  return (
    <header className="bg-indigo-600 text-white shadow-lg p-4 sticky top-0 z-50 flex justify-between items-center px-6 lg:px-12">
      <button onClick={() => setView("landing")} className="font-bold text-xl tracking-tight">Student Management</button>
      <nav className="space-x-6 flex items-center">
        <button onClick={() => setView("landing")} className="hover:text-indigo-200 transition-colors font-medium">Home</button>
        {isLoggedIn ? (
          <>
            <button onClick={() => setView("dashboard")} className="hover:text-indigo-200 transition-colors font-medium">Dashboard</button>
            <button onClick={handleSignOut} className="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-lg transition-colors font-medium text-sm">Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setView("login")} className="hover:text-indigo-200 transition-colors font-medium">Login</button>
            <button onClick={() => setView("signup")} className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors font-medium text-sm">Sign Up</button>
          </>
        )}
      </nav>
    </header>
  );
}
