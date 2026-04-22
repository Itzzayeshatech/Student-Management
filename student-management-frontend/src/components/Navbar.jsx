export default function Navbar({ setView }) {
  return (
    <header className="bg-indigo-600 text-white shadow-lg p-4 sticky top-0 z-50 flex justify-between items-center px-6 lg:px-12">
      <button onClick={() => setView("landing")} className="font-bold text-xl tracking-tight">Student Management</button>
      <nav className="space-x-6">
        <button onClick={() => setView("landing")} className="hover:text-indigo-200 transition-colors font-medium">Home</button>
        <button onClick={() => setView("dashboard")} className="hover:text-indigo-200 transition-colors font-medium">Dashboard</button>
      </nav>
    </header>
  );
}
