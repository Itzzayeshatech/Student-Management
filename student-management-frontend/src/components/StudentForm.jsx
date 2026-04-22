import { useState } from "react";
import { createStudent } from "../services/studentService";

export default function StudentForm({ onSuccess }) {
  const [form, setForm] = useState({ name: "", age: "", course: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.name === 'age' ? Number(e.target.value) : e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createStudent(form);
      if (result.success) {
        alert("Student registered successfully!");
        setForm({ name: "", age: "", course: "" });
        e.target.reset();
        if (onSuccess) onSuccess();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
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
        <button 
          disabled={isSubmitting}
          className={`w-full ${isSubmitting ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold py-3 rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all`}
        >
          {isSubmitting ? "Registering..." : "Register Student"}
        </button>
      </form>
    </div>
  );
}
