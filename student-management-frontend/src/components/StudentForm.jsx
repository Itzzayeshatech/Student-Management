import { useState } from "react";

export default function StudentForm() {
  const [form, setForm] = useState({ name: "", age: "", course: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(JSON.stringify(form)); // mock submit for now
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
          <input 
            name="name" 
            placeholder="e.g. Ayesha Tech" 
            onChange={handleChange} 
            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
          <input 
            name="age" 
            type="number"
            placeholder="e.g. 20" 
            onChange={handleChange} 
            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Course</label>
          <input 
            name="course" 
            placeholder="e.g. Computer Science" 
            onChange={handleChange} 
            className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
          />
        </div>
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all">
          Register Student
        </button>
      </form>
    </div>
  );
}
