export default function EmptyState() {
  return (
    <div className="text-center p-12 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200">
      <p className="text-slate-500 text-lg">No students found in the database.</p>
      <p className="text-slate-400 text-sm mt-1">Start by adding a new student record.</p>
    </div>
  );
}
