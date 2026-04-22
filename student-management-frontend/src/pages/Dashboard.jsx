import { useStudents } from "../hooks/useStudents";
import StudentTable from "../components/StudentTable";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import { useState } from "react";

export default function Dashboard({ onAddStudent }) {
  const { students, pagination, loading, refreshStudents, removeStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    refreshStudents(value, 1); // Reset to page 1 on search
  };

  const handlePageChange = (newPage) => {
    refreshStudents(searchTerm, newPage);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <main className="p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 mt-1">Manage and monitor all student registrations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <span className="absolute left-3 top-3 text-slate-400">🔍</span>
          </div>
          <Button onClick={onAddStudent} text="+ Add Student" variant="success" />
        </div>
      </div>

      {loading && students.length === 0 ? (
        <Loader />
      ) : students.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-2xl">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <StudentTable students={students} onDelete={removeStudent} />
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">
              Showing page <span className="font-semibold text-slate-900">{pagination.page}</span> of <span className="font-semibold text-slate-900">{totalPages || 1}</span>
            </p>
            <div className="flex gap-2">
              <button 
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={pagination.page >= totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg disabled:opacity-30 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
