export default function StudentTable({ students, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
            <th className="px-6 py-4 font-semibold text-slate-700">Age</th>
            <th className="px-6 py-4 font-semibold text-slate-700">Course</th>
            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((s) => (
            <tr key={s._id} className="hover:bg-indigo-50/30 transition-colors group">
              <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
              <td className="px-6 py-4 text-slate-600">{s.age}</td>
              <td className="px-6 py-4">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {s.course}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-slate-400 hover:text-indigo-600 mr-4 transition-colors">Edit</button>
                <button 
                  onClick={() => onDelete(s._id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
