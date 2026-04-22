export default function Navbar() {
  return (
    <header className="bg-indigo-600 text-white shadow-lg p-4 sticky top-0 z-50 flex justify-between items-center px-6 lg:px-12">
      <h1 className="font-bold text-xl tracking-tight">Student Management</h1>
      <nav className="space-x-6">
        <a href="#" className="hover:text-indigo-200 transition-colors">Home</a>
        <a href="#" className="hover:text-indigo-200 transition-colors">Dashboard</a>
      </nav>
    </header>
  );
}
